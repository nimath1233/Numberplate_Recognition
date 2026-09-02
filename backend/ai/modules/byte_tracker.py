"""
=============================================================================
Sri Lankan ANPR - ByteTrack Multi-Object Tracking Engine
=============================================================================
High-performance, pure-Python ByteTrack implementation based on Kalman Filtering
and two-stage bipartite matching (IoU + Hungarian Algorithm).

Features:
- Associates both high-score and low-score detections to handle occlusion & blur.
- Maintains persistent Track IDs across frames for trajectory analysis.
- Connects tracked trajectories directly with single-gate dual collision lines.
=============================================================================
"""

import numpy as np
from typing import List, Tuple, Optional, Dict, Any
from scipy.optimize import linear_sum_assignment


class TrackState:
    New = 0
    Tracked = 1
    Lost = 2
    Removed = 3


class KalmanFilterBbox:
    """
    Kalman filter for tracking bounding boxes in image space.
    State: [center_x, center_y, aspect_ratio, height, vx, vy, va, vh]
    """
    def __init__(self):
        ndim, dt = 4, 1.0

        # State transition matrix
        self._motion_mat = np.eye(2 * ndim, 2 * ndim)
        for i in range(ndim):
            self._motion_mat[i, ndim + i] = dt

        # Measurement projection matrix
        self._update_mat = np.eye(ndim, 2 * ndim)

        # Measurement noise weights
        self._std_weight_position = 1.0 / 20
        self._std_weight_velocity = 1.0 / 160

    def initiate(self, measurement: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Create track from initial measurement [cx, cy, a, h].
        """
        mean_pos = measurement
        mean_vel = np.zeros_like(mean_pos)
        mean = np.r_[mean_pos, mean_vel]

        std = [
            2 * self._std_weight_position * measurement[3],
            2 * self._std_weight_position * measurement[3],
            1e-2,
            2 * self._std_weight_position * measurement[3],
            10 * self._std_weight_velocity * measurement[3],
            10 * self._std_weight_velocity * measurement[3],
            1e-5,
            10 * self._std_weight_velocity * measurement[3]
        ]
        covariance = np.diag(np.square(std))
        return mean, covariance

    def predict(self, mean: np.ndarray, covariance: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Run Kalman filter prediction step.
        """
        std_pos = [
            self._std_weight_position * mean[3],
            self._std_weight_position * mean[3],
            1e-2,
            self._std_weight_position * mean[3]
        ]
        std_vel = [
            self._std_weight_velocity * mean[3],
            self._std_weight_velocity * mean[3],
            1e-5,
            self._std_weight_velocity * mean[3]
        ]
        motion_cov = np.diag(np.square(np.r_[std_pos, std_vel]))

        mean = np.dot(self._motion_mat, mean)
        covariance = np.linalg.multi_dot((
            self._motion_mat, covariance, self._motion_mat.T
        )) + motion_cov

        return mean, covariance

    def project(self, mean: np.ndarray, covariance: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Project state distribution to measurement space.
        """
        std = [
            self._std_weight_position * mean[3],
            self._std_weight_position * mean[3],
            1e-1,
            self._std_weight_position * mean[3]
        ]
        meas_cov = np.diag(np.square(std))

        mean = np.dot(self._update_mat, mean)
        covariance = np.linalg.multi_dot((
            self._update_mat, covariance, self._update_mat.T
        )) + meas_cov
        return mean, covariance

    def update(self, mean: np.ndarray, covariance: np.ndarray, measurement: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Run Kalman filter correction step with new measurement.
        """
        projected_mean, projected_cov = self.project(mean, covariance)

        chol_factor, lower = scipy_cho_factor(projected_cov)
        kalman_gain = scipy_cho_solve(
            (chol_factor, lower),
            np.dot(covariance, self._update_mat.T).T
        ).T
        innovation = measurement - projected_mean

        new_mean = mean + np.dot(innovation, kalman_gain.T)
        new_covariance = covariance - np.linalg.multi_dot((
            kalman_gain, projected_cov, kalman_gain.T
        ))
        return new_mean, new_covariance


def scipy_cho_factor(a: np.ndarray):
    from scipy.linalg import cho_factor
    return cho_factor(a, lower=True, check_finite=False)

def scipy_cho_solve(c_and_lower, b: np.ndarray):
    from scipy.linalg import cho_solve
    return cho_solve(c_and_lower, b, check_finite=False)


class STrack:
    _count = 0

    def __init__(self, tlwh: np.ndarray, score: float, det_meta: Optional[Dict[str, Any]] = None):
        self._tlwh = np.asarray(tlwh, dtype=np.float32)
        self.kalman_filter: Optional[KalmanFilterBbox] = None
        self.mean: Optional[np.ndarray] = None
        self.covariance: Optional[np.ndarray] = None
        self.is_activated = False

        self.score = float(score)
        self.tracklet_len = 0
        self.state = TrackState.New
        self.track_id = 0
        self.frame_id = 0
        self.start_frame = 0

        # Trajectory history: [(center_x, center_y), ...]
        self.history: List[Tuple[float, float]] = []
        self.det_meta = det_meta or {}
        self.plate_text_votes: Dict[str, int] = {}
        self.best_plate_text = ""

    @classmethod
    def next_id(cls) -> int:
        cls._count += 1
        return cls._count

    @classmethod
    def reset_counter(cls):
        cls._count = 0

    @property
    def tlwh(self) -> np.ndarray:
        """Get top-left-width-height [x, y, w, h]"""
        if self.mean is None:
            return self._tlwh.copy()
        ret = self.mean[:4].copy()
        ret[2] *= ret[3]
        ret[:2] -= ret[2:] / 2
        return ret

    @property
    def tlbr(self) -> np.ndarray:
        """Get top-left-bottom-right [x1, y1, x2, y2]"""
        ret = self.tlwh
        ret[2:] += ret[:2]
        return ret

    @property
    def centroid(self) -> Tuple[float, float]:
        """Get (center_x, center_y)"""
        box = self.tlbr
        return float((box[0] + box[2]) / 2.0), float((box[1] + box[3]) / 2.0)

    def to_xyah(self) -> np.ndarray:
        """Convert tlwh to [center_x, center_y, aspect_ratio, height]"""
        ret = self._tlwh.copy()
        ret[:2] += ret[2:] / 2.0
        ret[2] /= max(1e-5, ret[3])
        return ret

    def activate(self, kalman_filter: KalmanFilterBbox, frame_id: int):
        self.kalman_filter = kalman_filter
        self.track_id = self.next_id()
        self.mean, self.covariance = self.kalman_filter.initiate(self.to_xyah())
        self.tracklet_len = 0
        self.state = TrackState.Tracked
        self.frame_id = frame_id
        self.start_frame = frame_id
        self.is_activated = True
        self.history.append(self.centroid)


    def re_activate(self, new_track: "STrack", frame_id: int, new_id: bool = False):
        self.mean, self.covariance = self.kalman_filter.update(
            self.mean, self.covariance, new_track.to_xyah()
        )
        self.tracklet_len = 0
        self.state = TrackState.Tracked
        self.is_activated = True
        self.frame_id = frame_id
        self.score = new_track.score
        self.det_meta = new_track.det_meta
        if new_id:
            self.track_id = self.next_id()
        self.history.append(self.centroid)
        if len(self.history) > 60:
            self.history.pop(0)

    def update(self, new_track: "STrack", frame_id: int):
        self.frame_id = frame_id
        self.tracklet_len += 1

        new_xyah = new_track.to_xyah()
        self.mean, self.covariance = self.kalman_filter.update(
            self.mean, self.covariance, new_xyah
        )
        self.state = TrackState.Tracked
        self.is_activated = True
        self.score = new_track.score
        self.det_meta = new_track.det_meta
        self.history.append(self.centroid)
        if len(self.history) > 60:
            self.history.pop(0)

    def predict(self):
        mean_state = self.mean.copy()
        if self.state != TrackState.Tracked:
            mean_state[7] = 0
        self.mean, self.covariance = self.kalman_filter.predict(mean_state, self.covariance)

    def mark_lost(self):
        self.state = TrackState.Lost

    def mark_removed(self):
        self.state = TrackState.Removed


def bbox_ious(atlbr: np.ndarray, btlbr: np.ndarray) -> np.ndarray:
    """
    Compute DIoU (Distance-IoU) matrix between array of boxes A and array of boxes B.
    DIoU = IoU - (center_dist^2 / enclosing_diag^2), normalized to [0, 1].
    """
    ious = np.zeros((len(atlbr), len(btlbr)), dtype=np.float32)
    if atlbr.size == 0 or btlbr.size == 0:
        return ious

    for i, a in enumerate(atlbr):
        area_a = max(0.0, (a[2] - a[0])) * max(0.0, (a[3] - a[1]))
        acx = (a[0] + a[2]) / 2.0
        acy = (a[1] + a[3]) / 2.0

        for j, b in enumerate(btlbr):
            area_b = max(0.0, (b[2] - b[0])) * max(0.0, (b[3] - b[1]))
            bcx = (b[0] + b[2]) / 2.0
            bcy = (b[1] + b[3]) / 2.0

            xx1 = max(a[0], b[0])
            yy1 = max(a[1], b[1])
            xx2 = min(a[2], b[2])
            yy2 = min(a[3], b[3])
            w = max(0.0, xx2 - xx1)
            h = max(0.0, yy2 - yy1)
            inter = w * h
            union = area_a + area_b - inter
            iou = (inter / union) if union > 0 else 0.0

            # Smallest enclosing box diagonal squared
            enc_w = max(a[2], b[2]) - min(a[0], b[0])
            enc_h = max(a[3], b[3]) - min(a[1], b[1])
            c2 = enc_w ** 2 + enc_h ** 2 + 1e-6
            d2 = (acx - bcx) ** 2 + (acy - bcy) ** 2
            diou = iou - (d2 / c2)

            # Map DIoU [-1, 1] to positive similarity [0, 1]
            ious[i, j] = max(0.0, (diou + 1.0) / 2.0) if diou >= -0.5 else 0.0

    return ious



class ByteTracker:
    """
    ByteTrack: Multi-Object Tracking by Associating Every Detection Box
    """
    def __init__(
        self,
        track_thresh: float = 0.40,
        high_thresh: float = 0.50,
        match_thresh: float = 0.70,
        max_time_lost: int = 30
    ):
        self.track_thresh = track_thresh
        self.high_thresh = high_thresh
        self.match_thresh = match_thresh
        self.max_time_lost = max_time_lost

        self.kalman_filter = KalmanFilterBbox()
        self.tracked_stracks: List[STrack] = []
        self.lost_stracks: List[STrack] = []
        self.removed_stracks: List[STrack] = []

        self.frame_id = 0

    def reset(self):
        self.tracked_stracks.clear()
        self.lost_stracks.clear()
        self.removed_stracks.clear()
        self.frame_id = 0
        STrack.reset_counter()

    def update(self, detections: List[Dict[str, Any]]) -> List[STrack]:
        """
        Update tracker with new frame detections.
        Each detection: {'bbox': (x1, y1, x2, y2), 'confidence': float, ...}
        Returns list of active STrack objects.
        """
        self.frame_id += 1
        activated_stracks: List[STrack] = []
        refind_stracks: List[STrack] = []
        lost_stracks: List[STrack] = []
        removed_stracks: List[STrack] = []

        # Convert detections to STrack objects
        det_high: List[STrack] = []
        det_low: List[STrack] = []

        for det in detections:
            bbox = det.get("bbox")
            if not bbox or len(bbox) < 4:
                continue
            x1, y1, x2, y2 = float(bbox[0]), float(bbox[1]), float(bbox[2]), float(bbox[3])
            w = max(1.0, x2 - x1)
            h = max(1.0, y2 - y1)
            score = float(det.get("confidence", det.get("yolo_confidence", 0.0)))
            tlwh = np.array([x1, y1, w, h], dtype=np.float32)

            strack = STrack(tlwh, score, det)
            if score >= self.high_thresh:
                det_high.append(strack)
            elif score >= 0.10:
                det_low.append(strack)

        # Separate unconfirmed vs tracked stracks
        unconfirmed: List[STrack] = []
        tracked_stracks: List[STrack] = []
        for track in self.tracked_stracks:
            if not track.is_activated:
                unconfirmed.append(track)
            else:
                tracked_stracks.append(track)

        # Predict current locations with Kalman Filter
        strack_pool = tracked_stracks + self.lost_stracks
        for strack in strack_pool:
            strack.predict()

        # -------------------------------------------------------------
        # 1. First Association: High-Score Detections with Active Tracks
        # -------------------------------------------------------------
        dists = self._iou_distance(strack_pool, det_high)
        matches, u_track, u_detection = self._linear_assignment(dists, thresh=self.match_thresh)

        for itracked, idet in matches:
            track = strack_pool[itracked]
            det = det_high[idet]
            if track.state == TrackState.Tracked:
                track.update(det, self.frame_id)
                activated_stracks.append(track)
            else:
                track.re_activate(det, self.frame_id, new_id=False)
                refind_stracks.append(track)

        # -------------------------------------------------------------
        # 2. Second Association: Low-Score Detections with Remaining Tracks
        # -------------------------------------------------------------
        r_tracked_stracks = [strack_pool[i] for i in u_track if strack_pool[i].state == TrackState.Tracked]
        dists = self._iou_distance(r_tracked_stracks, det_low)
        matches, u_track_2, _ = self._linear_assignment(dists, thresh=0.5)

        for itracked, idet in matches:
            track = r_tracked_stracks[itracked]
            det = det_low[idet]
            if track.state == TrackState.Tracked:
                track.update(det, self.frame_id)
                activated_stracks.append(track)
            else:
                track.re_activate(det, self.frame_id, new_id=False)
                refind_stracks.append(track)

        # Unmatched tracks are marked lost
        for it in u_track_2:
            track = r_tracked_stracks[it]
            if track.state != TrackState.Lost:
                track.mark_lost()
                lost_stracks.append(track)

        # -------------------------------------------------------------
        # 3. Associate Unconfirmed Tracks with Remaining High Detections
        # -------------------------------------------------------------
        remain_det_high = [det_high[i] for i in u_detection]
        dists = self._iou_distance(unconfirmed, remain_det_high)
        matches, u_unconfirmed, u_detection_final = self._linear_assignment(dists, thresh=0.7)

        for itracked, idet in matches:
            unconfirmed[itracked].update(remain_det_high[idet], self.frame_id)
            activated_stracks.append(unconfirmed[itracked])

        for it in u_unconfirmed:
            track = unconfirmed[it]
            track.mark_removed()
            removed_stracks.append(track)

        # -------------------------------------------------------------
        # 4. Initialize New Tracks for Unmatched High Detections
        # -------------------------------------------------------------
        for inew in u_detection_final:
            track = remain_det_high[inew]
            if track.score >= self.high_thresh:
                track.activate(self.kalman_filter, self.frame_id)
                activated_stracks.append(track)

        # -------------------------------------------------------------
        # 5. Remove Expired Lost Tracks
        # -------------------------------------------------------------
        for track in self.lost_stracks:
            if self.frame_id - track.frame_id > self.max_time_lost:
                track.mark_removed()
                removed_stracks.append(track)

        # Update lists
        self.tracked_stracks = [t for t in self.tracked_stracks if t.state == TrackState.Tracked]
        self.tracked_stracks = self._merge_unique_tracks(self.tracked_stracks, activated_stracks)
        self.tracked_stracks = self._merge_unique_tracks(self.tracked_stracks, refind_stracks)

        self.lost_stracks = self._sub_tracks(self.lost_stracks, self.tracked_stracks)
        self.lost_stracks.extend(lost_stracks)
        self.lost_stracks = self._sub_tracks(self.lost_stracks, self.removed_stracks)
        self.removed_stracks.extend(removed_stracks)

        # Return only currently active tracked STracks
        output_stracks = [track for track in self.tracked_stracks if track.is_activated]
        return output_stracks

    @staticmethod
    def _iou_distance(atracks: List[STrack], btracks: List[STrack]) -> np.ndarray:
        if len(atracks) == 0 or len(btracks) == 0:
            return np.zeros((len(atracks), len(btracks)), dtype=np.float32)
        atlbrs = np.asarray([track.tlbr for track in atracks], dtype=np.float32)
        btlbrs = np.asarray([track.tlbr for track in btracks], dtype=np.float32)
        ious = bbox_ious(atlbrs, btlbrs)
        cost_matrix = 1.0 - ious
        return cost_matrix

    @staticmethod
    def _linear_assignment(cost_matrix: np.ndarray, thresh: float):
        if cost_matrix.size == 0:
            return np.empty((0, 2), dtype=int), tuple(range(cost_matrix.shape[0])), tuple(range(cost_matrix.shape[1]))
        row_ind, col_ind = linear_sum_assignment(cost_matrix)
        matches = []
        unmatched_a = list(range(cost_matrix.shape[0]))
        unmatched_b = list(range(cost_matrix.shape[1]))

        for r, c in zip(row_ind, col_ind):
            if cost_matrix[r, c] <= thresh:
                matches.append((r, c))
                if r in unmatched_a:
                    unmatched_a.remove(r)
                if c in unmatched_b:
                    unmatched_b.remove(c)

        return np.asarray(matches, dtype=int), tuple(unmatched_a), tuple(unmatched_b)

    @staticmethod
    def _merge_unique_tracks(tracks_a: List[STrack], tracks_b: List[STrack]) -> List[STrack]:
        exists = {t.track_id for t in tracks_a}
        merged = list(tracks_a)
        for t in tracks_b:
            if t.track_id not in exists:
                exists.add(t.track_id)
                merged.append(t)
        return merged

    @staticmethod
    def _sub_tracks(tracks_a: List[STrack], tracks_b: List[STrack]) -> List[STrack]:
        remove_ids = {t.track_id for t in tracks_b}
        return [t for t in tracks_a if t.track_id not in remove_ids]
