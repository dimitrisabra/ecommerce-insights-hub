// Centralized shared store for cross-role data (announcements, notifications, messages, etc.)

export interface Announcement {
  id: string;
  title: string;
  message: string;
  audience: 'All Users' | 'Sales Team' | 'Admins Only';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  createdBy: string;
}

export interface Notification {
  id: string;
  userId: string; // 'all' for broadcast
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'alert' | 'announcement';
  time: string;
  read: boolean;
  sourceId?: string; // links to announcement id, message id, etc.
}

export interface DirectMessage {
  id: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
  parentId?: string; // for replies
}

export interface UserStatus {
  userId: string;
  status: 'active' | 'suspended' | 'banned';
  reason?: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number; // percentage
  type: 'percentage' | 'fixed';
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
  createdAt: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  type: 'bug' | 'feature' | 'general' | 'complaint';
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  adminResponse?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  userId: string;
  userName: string;
  details: string;
  timestamp: string;
}

// ---- Singleton stores ----
let _announcements: Announcement[] = [
  { id: '1', title: 'Platform Maintenance', message: 'Scheduled maintenance this Sunday 2-4 AM UTC. Expect brief downtime.', audience: 'All Users', priority: 'high', createdAt: '2026-04-01', createdBy: 'System Admin' },
  { id: '2', title: 'New Feature: AI Forecasting', message: "We've launched AI-powered sales forecasting! Check it out in your dashboard.", audience: 'All Users', priority: 'normal', createdAt: '2026-03-28', createdBy: 'System Admin' },
  { id: '3', title: 'Q2 Targets Published', message: 'New quarterly targets are now available. Review and align your goals.', audience: 'Sales Team', priority: 'normal', createdAt: '2026-03-25', createdBy: 'System Admin' },
  { id: '4', title: 'Security Update', message: "We've enhanced authentication security. All sessions have been refreshed.", audience: 'All Users', priority: 'urgent', createdAt: '2026-03-20', createdBy: 'System Admin' },
];

let _notifications: Notification[] = [
  { id: 'n1', userId: 'all', title: 'Platform Maintenance', message: 'Scheduled maintenance this Sunday 2-4 AM UTC.', type: 'announcement', time: '2026-04-01', read: false, sourceId: '1' },
  { id: 'n2', userId: 'all', title: 'New Feature: AI Forecasting', message: "AI-powered sales forecasting is now live!", type: 'announcement', time: '2026-03-28', read: false, sourceId: '2' },
  { id: 'n3', userId: 'all', title: 'Q2 Targets Published', message: 'New quarterly targets are now available.', type: 'announcement', time: '2026-03-25', read: false, sourceId: '3' },
  { id: 'n4', userId: 'all', title: 'Security Update', message: 'Authentication security has been enhanced.', type: 'announcement', time: '2026-03-20', read: true, sourceId: '4' },
  // User-specific notifications
  { id: 'n10', userId: 'all', title: 'Revenue Milestone', message: "Congratulations! Platform exceeded $100k in total revenue.", type: 'success', time: '2026-03-29', read: false },
  { id: 'n11', userId: 'all', title: 'Weekly Report Ready', message: 'Your weekly sales performance report is ready for download.', type: 'info', time: '2026-03-27', read: true },
];

let _messages: DirectMessage[] = [];

let _userStatuses: UserStatus[] = [];

let _coupons: Coupon[] = [
  { id: 'c1', code: 'WELCOME10', discount: 10, type: 'percentage', minOrder: 50, maxUses: 100, usedCount: 23, expiresAt: '2026-06-30', active: true, createdAt: '2026-01-15' },
  { id: 'c2', code: 'SPRING25', discount: 25, type: 'percentage', minOrder: 100, maxUses: 50, usedCount: 12, expiresAt: '2026-05-31', active: true, createdAt: '2026-03-01' },
  { id: 'c3', code: 'FLAT50', discount: 50, type: 'fixed', minOrder: 200, maxUses: 30, usedCount: 30, expiresAt: '2026-04-15', active: false, createdAt: '2026-02-01' },
];

let _feedbacks: Feedback[] = [
  { id: 'f1', userId: 'u-001', userName: 'Demo User', type: 'feature', subject: 'Dark mode toggle', message: 'Would love a light/dark mode toggle in settings.', status: 'open', priority: 'medium', createdAt: '2026-03-30' },
  { id: 'f2', userId: 'u-002', userName: 'Demo User 2', type: 'bug', subject: 'Export CSV encoding', message: 'CSV export has encoding issues with special characters.', status: 'in_progress', priority: 'high', createdAt: '2026-03-28', adminResponse: 'We are investigating this issue.' },
];

let _auditLog: AuditLogEntry[] = [];

// Listeners for reactivity
type Listener = () => void;
const listeners: Set<Listener> = new Set();
export function subscribe(fn: Listener) { listeners.add(fn); return () => listeners.delete(fn); }
function notify() { listeners.forEach(fn => fn()); }

// ---- Announcements ----
export function getAnnouncements() { return _announcements; }
export function addAnnouncement(a: Omit<Announcement, 'id'>) {
  const ann: Announcement = { ...a, id: `a-${Date.now()}` };
  _announcements = [ann, ..._announcements];
  // Auto-create notification for all users
  const notif: Notification = {
    id: `n-${Date.now()}`,
    userId: 'all',
    title: ann.title,
    message: ann.message,
    type: 'announcement',
    time: ann.createdAt,
    read: false,
    sourceId: ann.id,
  };
  _notifications = [notif, ..._notifications];
  addAuditEntry('Announcement sent', ann.createdBy, `"${ann.title}" to ${ann.audience}`);
  notify();
  return ann;
}
export function deleteAnnouncement(id: string) {
  _announcements = _announcements.filter(a => a.id !== id);
  notify();
}

// ---- Notifications ----
export function getNotificationsForUser(userId: string) {
  return _notifications.filter(n => n.userId === 'all' || n.userId === userId);
}
export function addNotification(n: Omit<Notification, 'id'>) {
  const notif: Notification = { ...n, id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
  _notifications = [notif, ..._notifications];
  notify();
  return notif;
}
export function markNotificationRead(id: string) {
  _notifications = _notifications.map(n => n.id === id ? { ...n, read: true } : n);
  notify();
}
export function markAllNotificationsRead(userId: string) {
  _notifications = _notifications.map(n =>
    (n.userId === 'all' || n.userId === userId) ? { ...n, read: true } : n
  );
  notify();
}
export function deleteNotification(id: string) {
  _notifications = _notifications.filter(n => n.id !== id);
  notify();
}

// ---- Direct Messages ----
export function getMessagesForUser(userId: string) {
  return _messages.filter(m => m.toUserId === userId || m.fromUserId === userId);
}
export function getInboxForUser(userId: string) {
  return _messages.filter(m => m.toUserId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function getSentForUser(userId: string) {
  return _messages.filter(m => m.fromUserId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function sendMessage(msg: Omit<DirectMessage, 'id' | 'read' | 'createdAt'>) {
  const m: DirectMessage = {
    ...msg,
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    read: false,
    createdAt: new Date().toISOString().split('T')[0],
  };
  _messages = [m, ..._messages];
  // Also create a notification for the recipient
  addNotification({
    userId: msg.toUserId,
    title: `Message from ${msg.fromName}`,
    message: msg.subject,
    type: 'info',
    time: m.createdAt,
    read: false,
  });
  addAuditEntry('Message sent', msg.fromName, `To ${msg.toName}: "${msg.subject}"`);
  notify();
  return m;
}
export function markMessageRead(id: string) {
  _messages = _messages.map(m => m.id === id ? { ...m, read: true } : m);
  notify();
}

// ---- User Status ----
export function getUserStatus(userId: string): UserStatus | undefined {
  return _userStatuses.find(s => s.userId === userId);
}
export function setUserStatus(status: UserStatus) {
  _userStatuses = _userStatuses.filter(s => s.userId !== status.userId);
  _userStatuses.push(status);
  addAuditEntry(`User ${status.status}`, 'Admin', `User ${status.userId}: ${status.reason || 'No reason'}`);
  notify();
}

// ---- Coupons ----
export function getCoupons() { return _coupons; }
export function addCoupon(c: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>) {
  const coupon: Coupon = {
    ...c,
    id: `c-${Date.now()}`,
    usedCount: 0,
    createdAt: new Date().toISOString().split('T')[0],
  };
  _coupons = [..._coupons, coupon];
  addAuditEntry('Coupon created', 'Admin', `Code: ${coupon.code}, ${coupon.discount}${coupon.type === 'percentage' ? '%' : '$'} off`);
  notify();
  return coupon;
}
export function toggleCoupon(id: string) {
  _coupons = _coupons.map(c => c.id === id ? { ...c, active: !c.active } : c);
  notify();
}
export function deleteCoupon(id: string) {
  _coupons = _coupons.filter(c => c.id !== id);
  notify();
}

// ---- Feedback ----
export function getFeedbacks() { return _feedbacks; }
export function getFeedbacksForUser(userId: string) { return _feedbacks.filter(f => f.userId === userId); }
export function addFeedback(f: Omit<Feedback, 'id' | 'status' | 'createdAt'>) {
  const fb: Feedback = {
    ...f,
    id: `f-${Date.now()}`,
    status: 'open',
    createdAt: new Date().toISOString().split('T')[0],
  };
  _feedbacks = [fb, ..._feedbacks];
  addAuditEntry('Feedback submitted', f.userName, `[${f.type}] ${f.subject}`);
  notify();
  return fb;
}
export function updateFeedbackStatus(id: string, status: Feedback['status'], adminResponse?: string) {
  _feedbacks = _feedbacks.map(f => f.id === id ? { ...f, status, ...(adminResponse ? { adminResponse } : {}) } : f);
  notify();
}

// ---- Audit Log ----
export function getAuditLog() { return _auditLog; }
export function addAuditEntry(action: string, userName: string, details: string) {
  _auditLog = [{
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action,
    userId: '',
    userName,
    details,
    timestamp: new Date().toISOString(),
  }, ..._auditLog];
}
