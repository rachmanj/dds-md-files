# DDS Portal - Comprehensive Action Plan

## Feature-by-Feature Implementation Guide

### **Implementation Order & Timeline**

```
Phase 1 (Weeks 1-2): Infrastructure + Real-time Notifications
Phase 2 (Week 3): Enhanced Document Tracking
Phase 3 (Week 4): Analytics Dashboard
Phase 4 (Week 5): Multi-Factor Authentication
Phase 5 (Week 6): File Management & Watermarking
Phase 6 (Week 7): User Experience Enhancements
Phase 7 (Week 8): Testing & Deployment
```

---

## **PHASE 1: INFRASTRUCTURE SETUP & REAL-TIME NOTIFICATIONS**

### **1.1 Infrastructure Setup (Week 1)**

#### **Backend Tasks**

**1.1.1 Server Configuration**

```bash
# VPS 1 Setup
- Install and configure Nginx, PHP-FPM, Redis, Node.js
- Configure memory-optimized settings
- Setup SSL with Let's Encrypt
- Configure firewall and security
```

**1.1.2 Database Setup (VPS 2)**

```sql
-- Create new tables for notifications
CREATE TABLE notifications (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(100) NOT NULL,
    message VARCHAR(255),
    data JSON,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_unread (user_id, read_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED;

CREATE TABLE realtime_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    socket_id VARCHAR(255) NOT NULL,
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_ping TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_active (user_id, last_ping)
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED;
```

**1.1.3 Laravel Service Classes**

```php
// app/Services/NotificationService.php
class NotificationService {
    public function sendRealTimeNotification($userId, $type, $data);
    public function broadcastToUser($userId, $event, $data);
    public function getUnreadCount($userId);
    public function markAsRead($notificationId);
    public function getUserNotifications($userId, $filters);
}

// app/Services/SocketIOService.php
class SocketIOService {
    public function startServer();
    public function handleUserJoin($socket, $data);
    public function handleUserDisconnect($socket);
    public function broadcastToChannel($channel, $event, $data);
}
```

**1.1.4 API Controllers**

```php
// app/Http/Controllers/NotificationController.php
class NotificationController extends Controller {
    public function index(Request $request): JsonResponse;
    public function markAsRead($id): JsonResponse;
    public function markAllAsRead(): JsonResponse;
    public function unreadCount(): JsonResponse;
    public function getSettings(): JsonResponse;
    public function updateSettings(Request $request): JsonResponse;
}
```

**1.1.5 API Routes**

```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
});
```

#### **Frontend Tasks**

**1.1.6 Socket.IO Client Setup**

```typescript
// services/websocket/connection.ts
import { io, Socket } from "socket.io-client";

export class WebSocketService {
  private socket: Socket | null = null;

  connect(userId: number): void;
  disconnect(): void;
  on(event: string, callback: Function): void;
  emit(event: string, data: any): void;
  joinUserChannel(userId: number): void;
}
```

**1.1.7 Notification Components**

```typescript
// components/notifications/NotificationCenter.tsx
interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

// components/notifications/NotificationItem.tsx
interface NotificationItemProps {
  notification: Notification;
  onRead: (id: number) => void;
}

// components/notifications/NotificationBell.tsx
interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
}
```

**1.1.8 Real-time Hooks**

```typescript
// hooks/useNotifications.ts
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Methods: fetchNotifications, markAsRead, markAllAsRead
};

// hooks/useWebSocket.ts
export const useWebSocket = (userId: number) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Methods: connect, disconnect, emit, on
};
```

### **1.2 Real-time Distribution Updates (Week 2)**

#### **Backend Tasks**

**1.2.1 Distribution Event Broadcasting**

```php
// app/Services/DistributionEventService.php
class DistributionEventService {
    public function broadcastStatusChange($distribution, $oldStatus, $newStatus);
    public function broadcastVerificationUpdate($distribution, $verifierType);
    public function broadcastDocumentMovement($distribution, $documentType, $documentId);
    public function notifyStakeholders($distribution, $eventType);
}
```

**1.2.2 Enhanced Distribution Service**

```php
// Modify app/Services/DistributionService.php
// Add real-time notifications to existing methods:
public function verifySender($id, $documentVerifications, $notes) {
    // ... existing logic ...

    // Add real-time notification
    $this->distributionEventService->broadcastVerificationUpdate($distribution, 'sender');
    $this->notificationService->sendRealTimeNotification(
        $distribution->destination_department->users->pluck('id'),
        'distribution_verified_sender',
        ['distribution_id' => $id, 'distribution_number' => $distribution->distribution_number]
    );
}
```

**1.2.3 Event Listeners**

```php
// app/Listeners/DistributionEventListener.php
class DistributionEventListener {
    public function handleStatusChange(DistributionStatusChanged $event);
    public function handleVerificationUpdate(DistributionVerified $event);
    public function handleDocumentMovement(DocumentMoved $event);
}
```

#### **Frontend Tasks**

**1.2.4 Real-time Distribution Components**

```typescript
// components/distributions/DistributionCard.tsx
// Add real-time status indicator
const DistributionCard = ({ distribution, onUpdate }) => {
  const { socket } = useWebSocket();

  useEffect(() => {
    socket?.on(`distribution.${distribution.id}.updated`, (data) => {
      onUpdate(data);
    });
  }, [socket, distribution.id]);
};

// components/distributions/LiveStatusBadge.tsx
const LiveStatusBadge = ({ status, isLive }) => {
  return (
    <Badge
      className={`${getStatusColor(status)} ${isLive ? "animate-pulse" : ""}`}
    >
      {isLive && <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />}
      {status}
    </Badge>
  );
};
```

---

## **PHASE 2: ENHANCED DOCUMENT TRACKING (Week 3)**

### **2.1 Document Location Tracking**

#### **Backend Tasks**

**2.1.1 Database Tables**

```sql
CREATE TABLE document_locations (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    document_type ENUM('invoice', 'additional_document') NOT NULL,
    document_id INT UNSIGNED NOT NULL,
    location_code VARCHAR(10) NOT NULL,
    moved_by INT UNSIGNED,
    moved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    distribution_id INT UNSIGNED NULL,
    INDEX idx_document (document_type, document_id),
    FOREIGN KEY (moved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED;

CREATE TABLE tracking_events (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    trackable_type VARCHAR(50) NOT NULL,
    trackable_id INT UNSIGNED NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    user_id INT UNSIGNED,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_trackable (trackable_type, trackable_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED;
```

**2.1.2 Tracking Service**

```php
// app/Services/DocumentTrackingService.php
class DocumentTrackingService {
    public function trackMovement($docType, $docId, $fromLoc, $toLoc, $reason);
    public function getDocumentHistory($docType, $docId);
    public function getLocationTimeline($docType, $docId);
    public function getCurrentLocation($docType, $docId);
    public function getDocumentsInLocation($locationCode);
}
```

**2.1.3 Enhanced Distribution Service Integration**

```php
// Modify existing DistributionService receive() method
public function receive(int $id): Distribution {
    // ... existing logic ...

    // Enhanced location tracking
    foreach ($distribution->documents as $doc) {
        $this->documentTrackingService->trackMovement(
            $doc->document_type,
            $doc->document_id,
            $distribution->originDepartment->location_code,
            $distribution->destinationDepartment->location_code,
            "Distribution #{$distribution->distribution_number}"
        );
    }

    // ... rest of existing logic ...
}
```

**2.1.4 API Controllers**

```php
// app/Http/Controllers/DocumentTrackingController.php
class DocumentTrackingController extends Controller {
    public function getHistory($documentType, $documentId): JsonResponse;
    public function getTimeline($documentType, $documentId): JsonResponse;
    public function getLocationDocuments($locationCode): JsonResponse;
    public function trackMovement(Request $request): JsonResponse;
}
```

#### **Frontend Tasks**

**2.1.5 Document Timeline Component**

```typescript
// components/tracking/DocumentTimeline.tsx
interface TimelineEvent {
  id: number;
  event_type: string;
  location_code: string;
  moved_by: string;
  moved_at: string;
  reason?: string;
}

const DocumentTimeline = ({ documentType, documentId }) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  // Fetch and display timeline with visual progress indicator
};

// components/tracking/LocationBadge.tsx
const LocationBadge = ({ locationCode, isCurrentLocation }) => {
  return (
    <Badge
      variant={isCurrentLocation ? "default" : "secondary"}
      className={isCurrentLocation ? "bg-green-500" : ""}
    >
      {locationCode}
    </Badge>
  );
};
```

**2.1.6 Enhanced Distribution View**

```typescript
// pages/distributions/[id].tsx
// Add tracking tab to existing distribution view
const DistributionDetailPage = () => {
  return (
    <Tabs>
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="tracking">Tracking</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>

      <TabsContent value="tracking">
        <DocumentTrackingPanel distributionId={id} />
      </TabsContent>
    </Tabs>
  );
};
```

---

## **PHASE 3: ANALYTICS DASHBOARD (Week 4)**

### **3.1 Analytics Data Collection**

#### **Backend Tasks**

**3.1.1 Analytics Tables**

```sql
CREATE TABLE weekly_analytics (
    id SMALLINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    week_start DATE NOT NULL UNIQUE,
    total_distributions SMALLINT DEFAULT 0,
    completed_distributions SMALLINT DEFAULT 0,
    avg_completion_hours DECIMAL(5,1) DEFAULT 0,
    active_users TINYINT DEFAULT 0,
    department_stats JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED;

CREATE TABLE user_activities (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT UNSIGNED,
    duration_seconds INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_activity (user_id, activity_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED;
```

**3.1.2 Analytics Service**

```php
// app/Services/AnalyticsService.php
class AnalyticsService {
    public function getDashboardMetrics($userId);
    public function getDistributionMetrics($departmentId, $dateRange);
    public function getPerformanceMetrics($departmentId, $period);
    public function getUserActivityMetrics($userId, $period);
    public function generateWeeklyReport($weekStart);
}

// app/Services/MetricsCollectionService.php
class MetricsCollectionService {
    public function collectWeeklyAnalytics();
    public function collectUserActivity($userId, $activityType, $entityType, $entityId);
    public function calculatePerformanceMetrics();
}
```

**3.1.3 Scheduled Analytics Collection**

```php
// app/Console/Commands/CollectAnalytics.php
class CollectAnalytics extends Command {
    protected $signature = 'analytics:collect';

    public function handle() {
        $this->metricsService->collectWeeklyAnalytics();
        $this->info('Analytics collected successfully');
    }
}

// app/Console/Kernel.php
protected function schedule(Schedule $schedule) {
    $schedule->command('analytics:collect')->weekly();
}
```

**3.1.4 Analytics API Controller**

```php
// app/Http/Controllers/AnalyticsController.php
class AnalyticsController extends Controller {
    public function dashboard(Request $request): JsonResponse;
    public function performance(Request $request): JsonResponse;
    public function departmentMetrics($departmentId): JsonResponse;
    public function userActivity($userId): JsonResponse;
    public function exportReport(Request $request): JsonResponse;
}
```

#### **Frontend Tasks**

**3.1.5 Dashboard Widget Components**

```typescript
// components/analytics/DashboardWidget.tsx
interface WidgetProps {
  title: string;
  type: "chart" | "metric" | "list";
  data: any;
  loading?: boolean;
}

// components/analytics/ChartWidget.tsx
const ChartWidget = ({ chartType, data, options }) => {
  const ChartComponent = {
    bar: Bar,
    line: Line,
    doughnut: Doughnut,
    pie: Pie,
  }[chartType];

  return <ChartComponent data={data} options={options} />;
};

// components/analytics/MetricCard.tsx
const MetricCard = ({ title, value, change, icon, color }) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <p
              className={`text-sm ${
                change > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {change > 0 ? "+" : ""}
              {change}%
            </p>
          )}
        </div>
        <div className={`text-${color}-500 text-2xl`}>{icon}</div>
      </div>
    </Card>
  );
};
```

**3.1.6 Main Analytics Dashboard**

```typescript
// pages/analytics/dashboard.tsx
const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [dateRange, setDateRange] = useState("7d");

  const widgets = [
    { id: "distributions", title: "Distribution Overview", type: "doughnut" },
    { id: "performance", title: "Performance Trend", type: "line" },
    { id: "departments", title: "Department Activity", type: "bar" },
    { id: "metrics", title: "Key Metrics", type: "metric" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {widgets.map((widget) => (
        <DashboardWidget
          key={widget.id}
          {...widget}
          data={metrics?.[widget.id]}
        />
      ))}
    </div>
  );
};
```

---

## **PHASE 4: MULTI-FACTOR AUTHENTICATION (Week 5)**

### **4.1 MFA Backend Implementation**

#### **Backend Tasks**

**4.1.1 MFA Database Tables**

```sql
CREATE TABLE user_two_factor_auth (
    user_id INT UNSIGNED PRIMARY KEY,
    secret VARCHAR(32) NOT NULL,
    recovery_codes JSON,
    enabled_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED;

CREATE TABLE login_attempts (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    successful BOOLEAN DEFAULT FALSE,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_ip (email, ip_address)
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED;
```

**4.1.2 MFA Service**

```php
// app/Services/TwoFactorAuthService.php
class TwoFactorAuthService {
    public function generateSecret(): string;
    public function generateQrCode($user, $secret): string;
    public function verifyCode($secret, $code): bool;
    public function generateRecoveryCodes(): array;
    public function enableTwoFactor($userId, $secret, $recoveryCodes);
    public function disableTwoFactor($userId);
    public function verifyRecoveryCode($userId, $code): bool;
}
```

**4.1.3 Enhanced Authentication**

```php
// app/Http/Controllers/Auth/TwoFactorController.php
class TwoFactorController extends Controller {
    public function enable(Request $request): JsonResponse;
    public function disable(Request $request): JsonResponse;
    public function generateSecret(): JsonResponse;
    public function verify(Request $request): JsonResponse;
    public function regenerateRecoveryCodes(): JsonResponse;
}

// app/Http/Requests/TwoFactorRequest.php
class TwoFactorRequest extends FormRequest {
    public function rules() {
        return [
            'code' => 'required|string|size:6',
            'password' => 'required|string'
        ];
    }
}
```

**4.1.4 Login Attempt Tracking**

```php
// app/Services/LoginAttemptService.php
class LoginAttemptService {
    public function recordAttempt($email, $successful, $ipAddress, $userAgent);
    public function getRecentAttempts($email, $hours = 24);
    public function isRateLimited($email, $ipAddress): bool;
    public function getFailedAttempts($email, $timeframe): int;
}
```

#### **Frontend Tasks**

**4.1.5 MFA Setup Components**

```typescript
// components/auth/TwoFactorSetup.tsx
const TwoFactorSetup = () => {
  const [step, setStep] = useState<"generate" | "verify" | "complete">(1);
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const handleEnableTwoFactor = async () => {
    // Implementation
  };

  return (
    <div className="max-w-md mx-auto">
      {step === "generate" && <SecretGeneration />}
      {step === "verify" && <CodeVerification />}
      {step === "complete" && <SetupComplete />}
    </div>
  );
};

// components/auth/TwoFactorInput.tsx
const TwoFactorInput = ({ onSubmit, loading }) => {
  const [code, setCode] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(code);
      }}
    >
      <Input
        type="text"
        placeholder="Enter 6-digit code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        maxLength={6}
      />
      <Button type="submit" disabled={loading || code.length !== 6}>
        Verify Code
      </Button>
    </form>
  );
};
```

**4.1.6 Enhanced Login Flow**

```typescript
// pages/auth/login.tsx
const LoginPage = () => {
  const [step, setStep] = useState<"credentials" | "two-factor">("credentials");
  const [user, setUser] = useState(null);

  const handleCredentialsSubmit = async (credentials) => {
    const response = await login(credentials);
    if (response.requires_2fa) {
      setUser(response.user);
      setStep("two-factor");
    } else {
      // Redirect to dashboard
    }
  };

  const handleTwoFactorSubmit = async (code) => {
    await verifyTwoFactor(user.id, code);
    // Redirect to dashboard
  };

  return (
    <div>
      {step === "credentials" && (
        <CredentialsForm onSubmit={handleCredentialsSubmit} />
      )}
      {step === "two-factor" && (
        <TwoFactorInput onSubmit={handleTwoFactorSubmit} />
      )}
    </div>
  );
};
```

---

## **PHASE 5: FILE MANAGEMENT & WATERMARKING (Week 6)**

### **5.1 Watermarking System**

#### **Backend Tasks**

**5.1.1 Watermarking Tables**

```sql
CREATE TABLE file_watermarks (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    original_file_id INT UNSIGNED NOT NULL,
    watermarked_path VARCHAR(200) NOT NULL,
    watermark_text VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (original_file_id) REFERENCES invoice_attachments(id) ON DELETE CASCADE
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED;

CREATE TABLE file_processing_jobs (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    file_id INT UNSIGNED NOT NULL,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    attempts INT DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status_type (status, job_type)
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED;
```

**5.1.2 Watermarking Service**

```php
// app/Services/WatermarkService.php
class WatermarkService {
    public function addWatermark($filePath, $watermarkText = null);
    public function addImageWatermark($filePath, $watermarkText);
    public function addPdfWatermark($filePath, $watermarkText);
    public function generateCustomWatermark($userId, $timestamp);
    public function getWatermarkedPath($originalPath);
}

// app/Services/FileProcessingService.php
class FileProcessingService {
    public function processUploadedFile($file, $attachmentId);
    public function generateThumbnail($filePath);
    public function queueWatermarking($attachmentId);
    public function processWatermarkingQueue();
}
```

**5.1.3 File Processing Jobs**

```php
// app/Jobs/ProcessFileWatermark.php
class ProcessFileWatermark implements ShouldQueue {
    private $attachmentId;

    public function handle(WatermarkService $watermarkService) {
        $attachment = InvoiceAttachment::findOrFail($this->attachmentId);
        $watermarkedPath = $watermarkService->addWatermark(
            $attachment->file_path,
            $this->generateWatermarkText($attachment)
        );

        FileWatermark::create([
            'original_file_id' => $this->attachmentId,
            'watermarked_path' => $watermarkedPath,
            'watermark_text' => $this->generateWatermarkText($attachment)
        ]);
    }
}
```

**5.1.4 Enhanced File Controller**

```php
// Modify app/Http/Controllers/InvoiceAttachmentController.php
public function store(Request $request, $invoiceId) {
    // ... existing validation ...

    $attachment = InvoiceAttachment::create([
        'invoice_id' => $invoiceId,
        'file_name' => $file->getClientOriginalName(),
        'file_path' => $filePath,
        'file_size' => $file->getSize(),
        'mime_type' => $file->getMimeType(),
        'processing_status' => 'pending'
    ]);

    // Queue watermarking
    ProcessFileWatermark::dispatch($attachment->id);

    return response()->json($attachment);
}

public function download($invoiceId, $attachmentId, $watermarked = false) {
    $attachment = InvoiceAttachment::findOrFail($attachmentId);

    if ($watermarked) {
        $watermark = $attachment->watermark;
        $filePath = $watermark ? $watermark->watermarked_path : $attachment->file_path;
    } else {
        $filePath = $attachment->file_path;
    }

    return response()->download($filePath);
}
```

#### **Frontend Tasks**

**5.1.5 Enhanced File Upload**

```typescript
// components/attachments/EnhancedFileUpload.tsx
const EnhancedFileUpload = ({ invoiceId, onUploadComplete }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);

  const handleUpload = async () => {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("watermark_enabled", watermarkEnabled.toString());

      await uploadWithProgress(formData, invoiceId, (progress) => {
        setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
      });
    }
  };

  return (
    <div>
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={watermarkEnabled}
            onChange={(e) => setWatermarkEnabled(e.target.checked)}
          />
          <span>Apply security watermark</span>
        </label>
      </div>
      {/* File drop zone and upload logic */}
    </div>
  );
};
```

**5.1.6 File Preview with Watermark Options**

```typescript
// components/attachments/FilePreview.tsx
const FilePreview = ({ attachment, showWatermarked = false }) => {
  const [viewMode, setViewMode] = useState<"original" | "watermarked">(
    "original"
  );

  const downloadFile = (watermarked = false) => {
    const url = `/api/invoices/${attachment.invoice_id}/attachments/${attachment.id}/download?watermarked=${watermarked}`;
    window.open(url, "_blank");
  };

  return (
    <div>
      <div className="mb-4 flex space-x-2">
        <Button
          variant={viewMode === "original" ? "default" : "outline"}
          onClick={() => setViewMode("original")}
        >
          Original
        </Button>
        <Button
          variant={viewMode === "watermarked" ? "default" : "outline"}
          onClick={() => setViewMode("watermarked")}
        >
          With Watermark
        </Button>
      </div>

      <div className="mb-4">
        <Button onClick={() => downloadFile(false)}>Download Original</Button>
        <Button onClick={() => downloadFile(true)}>Download Watermarked</Button>
      </div>

      {/* File preview content */}
    </div>
  );
};
```

---

## **PHASE 6: USER EXPERIENCE ENHANCEMENTS (Week 7)**

### **6.1 Dark Mode & Theming**

#### **Backend Tasks**

**6.1.1 User Preferences Table**

```sql
CREATE TABLE user_preferences (
    user_id INT UNSIGNED PRIMARY KEY,
    theme ENUM('light', 'dark') DEFAULT 'light',
    dashboard_layout TEXT,
    notification_settings TINYINT DEFAULT 7,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED;
```

**6.1.2 Preferences Service**

```php
// app/Services/UserPreferencesService.php
class UserPreferencesService {
    public function getUserPreferences($userId);
    public function updatePreferences($userId, $preferences);
    public function setTheme($userId, $theme);
    public function setDashboardLayout($userId, $layout);
    public function setNotificationSettings($userId, $settings);
}
```

**6.1.3 Preferences API Controller**

```php
// app/Http/Controllers/UserPreferencesController.php
class UserPreferencesController extends Controller {
    public function show(): JsonResponse;
    public function update(Request $request): JsonResponse;
    public function updateTheme(Request $request): JsonResponse;
    public function updateDashboardLayout(Request $request): JsonResponse;
}
```

#### **Frontend Tasks**

**6.1.4 Theme Provider**

```typescript
// providers/ThemeProvider.tsx
import { ThemeProvider } from "next-themes";

export function CustomThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {children}
    </ThemeProvider>
  );
}

// hooks/useTheme.ts
export const useTheme = () => {
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState(null);

  const updateTheme = async (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    await saveUserPreference("theme", newTheme);
  };

  return { theme, updateTheme, preferences };
};
```

**6.1.5 Theme Toggle Component**

```typescript
// components/ui/ThemeToggle.tsx
const ThemeToggle = () => {
  const { theme, updateTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => updateTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
};
```

### **6.2 Customizable Dashboard**

#### **Frontend Tasks**

**6.2.1 Drag & Drop Dashboard**

```typescript
// components/dashboard/CustomizableDashboard.tsx
import GridLayout from "react-grid-layout";

const CustomizableDashboard = () => {
  const [layout, setLayout] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const saveLayout = async (newLayout) => {
    setLayout(newLayout);
    await saveUserPreference("dashboard_layout", newLayout);
  };

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h1>Dashboard</h1>
        <Button onClick={() => setEditMode(!editMode)}>
          {editMode ? "Save Layout" : "Customize"}
        </Button>
      </div>

      <GridLayout
        className="layout"
        layout={layout}
        onLayoutChange={saveLayout}
        isDraggable={editMode}
        isResizable={editMode}
        cols={12}
        rowHeight={100}
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="widget-container">
            <WidgetComponent {...widget} />
          </div>
        ))}
      </GridLayout>
    </div>
  );
};
```

**6.2.2 Widget Gallery**

```typescript
// components/dashboard/WidgetGallery.tsx
const WidgetGallery = ({ onAddWidget }) => {
  const availableWidgets = [
    { id: "distribution-status", name: "Distribution Status", icon: "📊" },
    { id: "recent-activity", name: "Recent Activity", icon: "📋" },
    { id: "performance-metrics", name: "Performance Metrics", icon: "📈" },
    { id: "pending-tasks", name: "Pending Tasks", icon: "⏳" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {availableWidgets.map((widget) => (
        <Card
          key={widget.id}
          className="p-4 cursor-pointer hover:shadow-lg"
          onClick={() => onAddWidget(widget)}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">{widget.icon}</div>
            <div className="text-sm">{widget.name}</div>
          </div>
        </Card>
      ))}
    </div>
  );
};
```

---

## **PHASE 7: TESTING & DEPLOYMENT (Week 8)**

### **7.1 Testing Strategy**

#### **Backend Testing**

**7.1.1 Feature Tests**

```php
// tests/Feature/NotificationTest.php
class NotificationTest extends TestCase {
    public function test_user_can_receive_realtime_notifications();
    public function test_notification_marked_as_read();
    public function test_websocket_connection_established();
}

// tests/Feature/AnalyticsTest.php
class AnalyticsTest extends TestCase {
    public function test_dashboard_metrics_calculated_correctly();
    public function test_weekly_analytics_collection();
    public function test_performance_metrics_accuracy();
}

// tests/Feature/TwoFactorAuthTest.php
class TwoFactorAuthTest extends TestCase {
    public function test_two_factor_setup_process();
    public function test_code_verification();
    public function test_recovery_codes_work();
}
```

**7.1.2 Performance Tests**

```php
// tests/Performance/DatabaseOptimizationTest.php
class DatabaseOptimizationTest extends TestCase {
    public function test_query_performance_within_limits();
    public function test_index_effectiveness();
    public function test_memory_usage_optimization();
}
```

#### **Frontend Testing**

**7.1.3 Component Tests**

```typescript
// __tests__/components/notifications/NotificationCenter.test.tsx
describe("NotificationCenter", () => {
  test("displays notifications correctly", () => {});
  test("marks notifications as read", () => {});
  test("handles real-time updates", () => {});
});

// __tests__/components/dashboard/CustomizableDashboard.test.tsx
describe("CustomizableDashboard", () => {
  test("allows widget rearrangement", () => {});
  test("saves layout preferences", () => {});
  test("loads user layout on mount", () => {});
});
```

### **7.2 Deployment Process**

**7.2.1 Production Setup Checklist**

```bash
# VPS Configuration Checklist
□ Server hardening and security updates
□ SSL certificate installation and renewal setup
□ Database optimization and backup configuration
□ File permissions and ownership setup
□ Process monitoring (supervisor, PM2)
□ Log rotation and management
□ Performance monitoring setup
□ Firewall rules configuration
```

**7.2.2 Deployment Scripts**

```bash
# deploy.sh
#!/bin/bash
set -e

echo "Starting DDS Portal deployment..."

# Backend deployment
cd /var/www/dds-portal/backend
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo supervisorctl restart laravel-queue

# Frontend deployment
cd /var/www/dds-portal/frontend
git pull origin main
npm ci
npm run build
pm2 restart dds-frontend

# Clear caches
php artisan cache:clear
sudo systemctl restart nginx

echo "Deployment completed successfully!"
```

**7.2.3 Health Check Script**

```bash
# health-check.sh
#!/bin/bash

# Check services
services=("nginx" "mysql" "redis-server" "php8.2-fpm")
for service in "${services[@]}"; do
    if ! systemctl is-active --quiet $service; then
        echo "ERROR: $service is not running"
        exit 1
    fi
done

# Check application endpoints
endpoints=("http://localhost/api/health" "http://localhost:3000/api/health")
for endpoint in "${endpoints[@]}"; do
    if ! curl -f $endpoint > /dev/null 2>&1; then
        echo "ERROR: $endpoint is not responding"
        exit 1
    fi
done

echo "All health checks passed!"
```

---

## **IMPLEMENTATION CHECKLIST**

### **Backend Completion Checklist**

- [ ] **Phase 1**: Infrastructure setup, Redis configuration, Socket.IO server
- [ ] **Phase 1**: Notification service, WebSocket handlers, real-time events
- [ ] **Phase 2**: Document tracking service, location history, movement tracking
- [ ] **Phase 3**: Analytics service, metrics collection, dashboard APIs
- [ ] **Phase 4**: MFA implementation, TOTP verification, recovery codes
- [ ] **Phase 5**: Watermarking service, file processing queue, enhanced uploads
- [ ] **Phase 6**: User preferences service, theme management APIs
- [ ] **Phase 7**: Testing suite, performance optimization, deployment scripts

### **Frontend Completion Checklist**

- [ ] **Phase 1**: WebSocket client, notification components, real-time indicators
- [ ] **Phase 2**: Document timeline, tracking components, location badges
- [ ] **Phase 3**: Dashboard widgets, chart components, analytics views
- [ ] **Phase 4**: MFA setup flow, two-factor input, enhanced login
- [ ] **Phase 5**: Enhanced file upload, watermark preview, processing status
- [ ] **Phase 6**: Theme provider, dark mode toggle, customizable dashboard
- [ ] **Phase 7**: Component tests, E2E tests, production optimization

### **Deployment Checklist**

- [ ] **Infrastructure**: VPS setup, server configuration, security hardening
- [ ] **Database**: Migration execution, optimization, backup setup
- [ ] **Application**: Code deployment, dependency installation, cache setup
- [ ] **Monitoring**: Health checks, log monitoring, performance tracking
- [ ] **Security**: SSL setup, firewall configuration, access controls
- [ ] **Testing**: Production testing, load testing, security testing

This comprehensive action plan provides detailed, step-by-step implementation guidance for each feature, organized by backend and frontend tasks with clear deliverables and checkpoints for successful project completion.
