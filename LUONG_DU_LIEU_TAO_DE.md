# Luồng dữ liệu chức năng TẠO ĐỀ (Create Exam)

Tài liệu mô tả chi tiết luồng di chuyển dữ liệu từ khi người dùng bấm "Lưu Đề Thi" trên client đến khi dữ liệu được lưu vào database và phản hồi trả về client.

---

## TỔNG QUAN LUỒNG

```
[Client - Trang tạo đề]
    → User bấm "Lưu Đề Thi"
    → handleSubmit() gom dữ liệu thành payload
    → apiClient.post("/api/exams/create", payload)
    → HTTP POST gửi qua mạng (baseURL + path)

[Server - Flask]
    → CORS cho phép request
    → Blueprint "exam" bắt route POST /api/exams/create
    → create_exam() trong exam_controller nhận request
    → exam_repo.create_full_exam(data, created_by)
    → ExamRepository tạo Exam, Question, Option qua SQLAlchemy
    → db.session.commit() ghi vào database
    → return jsonify(...) trả response về client

[Client]
    → Nhận response 201
    → alert("Tạo đề thi thành công!")
    → router.push('/home')
```

---

## PHẦN 1: CLIENT – Nơi dữ liệu được gom và gửi đi

### 1.1 Trang tạo đề (View) – `client/app/exams/create/page.tsx`

**State chứa dữ liệu đề thi:**

```tsx
// Dòng 26-31: Thông tin chung đề
const [examInfo, setExamInfo] = useState({
  title: '',
  description: '',
  duration: 60,
});

// Dòng 33-42: Danh sách câu hỏi (mỗi câu có content, score, question_type, options)
const [questions, setQuestions] = useState<Question[]>([...]);
```

**Khi user bấm "Lưu Đề Thi"** – nút gọi `handleSubmit`:

```tsx
// Trong JSX, dòng ~363-368 (nút Lưu Đề Thi):
<button
  onClick={handleSubmit}
  disabled={loading}
  className="..."
>
  {loading ? 'Đang lưu...' : '💾 Lưu Đề Thi'}
</button>
```

**Hàm gửi dữ liệu đi – `handleSubmit` (dòng 159-177):**

```tsx
const handleSubmit = async () => {
  if (!user) return;
  setLoading(true);

  // BƯỚC 1: Gom dữ liệu từ state thành 1 object (payload)
  const payload = {
    ...examInfo,           // title, description, duration
    created_by: user.id,   // id người tạo (từ authStore)
    questions: questions,  // mảng câu hỏi, mỗi phần tử có content, score, question_type, options
  };

  try {
    // BƯỚC 2: GỬI ĐI – Gọi apiClient.post(...)
    await apiClient.post("/api/exams/create", payload);

    // BƯỚC 3: Sau khi server trả 2xx thành công
    alert("✅ Tạo đề thi thành công!");
    router.push('/home');   // Chuyển sang trang home
  } catch (error: any) {
    alert(error?.response?.data?.error || "❌ Lỗi khi tạo đề thi");
  } finally {
    setLoading(false);
  }
};
```

- **Dữ liệu gửi đi:** `payload` (JSON) gồm `title`, `description`, `duration`, `created_by`, `questions`.
- **Điểm gửi:** Dòng `await apiClient.post("/api/exams/create", payload)` – đây là nơi client “chuyển” dữ liệu sang phía server (qua HTTP).

---

### 1.2 Lớp gọi API – `client/services/apiClient.ts`

**Khởi tạo axios:**

```ts
// Dòng 4-9
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,   // Mọi request đều gửi tới đây
  withCredentials: false,
});
```

**Interceptor trước khi gửi (dòng 11-24):**

- Mỗi khi gọi `apiClient.post(...)`, request đi qua đây.
- Thêm header `Authorization: Bearer <token>` nếu có token trong `localStorage`.
- Với FormData thì không set `Content-Type` (để axios tự set boundary).

**Khi `apiClient.post("/api/exams/create", payload)` chạy:**

1. URL cuối cùng = `baseURL` + path = `http://127.0.0.1:5000/api/exams/create`.
2. Method = POST.
3. Body = `payload` (axios tự serialize thành JSON, header `Content-Type: application/json`).
4. Request được gửi qua mạng tới server.

→ **Kết luận client:** Dữ liệu “đi qua” từ `handleSubmit` → `apiClient.post` → HTTP POST tới server; không có service riêng cho exam (trang create gọi thẳng `apiClient`).

---

## PHẦN 2: SERVER – Nơi nhận request và ghi database

### 2.1 Đăng ký route – `server/app/__init__.py`

```python
# Dòng 26-30
from app.controllers.exam_controller import exam_bp
from app.controllers.auth_controller import auth_bp

app.register_blueprint(exam_bp)   # Mọi route /api/exams/... do exam_bp xử lý
app.register_blueprint(auth_bp)
```

- `exam_bp` có `url_prefix="/api/exams"` (xem dòng 11 trong exam_controller).
- Route trong controller khai báo thêm path và method → route đầy đủ cho tạo đề là `POST /api/exams/create`.

---

### 2.2 Controller – Nhận request và gọi Repository

**File:** `server/app/controllers/exam_controller.py`

**Blueprint và Repository (dòng 11-12):**

```python
exam_bp = Blueprint("exam", __name__, url_prefix="/api/exams")
exam_repo = ExamRepository()   # Tạo 1 instance dùng chung cho mọi request
```

**Route tạo đề (dòng 64-82):**

```python
@exam_bp.route("/create", methods=["POST"])
def create_exam():
    # BƯỚC 1: Lấy body JSON từ request (chính là payload client gửi)
    data = request.get_json() or {}
    created_by = data.get("created_by")

    # BƯỚC 2: Validate
    if not data.get("title") or not data.get("questions"):
        return jsonify({"error": "Tiêu đề và câu hỏi không được để trống"}), 400

    try:
        # BƯỚC 3: GỌI REPOSITORY – Chuyển dữ liệu sang lớp Repository
        new_exam = exam_repo.create_full_exam(data, created_by=created_by)

        # BƯỚC 4: Trả response về client (JSON + status 201)
        return (
            jsonify({
                "message": "Tạo đề thi thành công!",
                "exam_id": new_exam.id,
            }),
            201,
        )
    except Exception as e:
        return jsonify({"error": "Lỗi Server", "details": str(e)}), 500
```

- **Dữ liệu từ client vào server:** qua `request.get_json()` → biến `data`.
- **Chuyển sang tầng dưới:** dòng `new_exam = exam_repo.create_full_exam(data, created_by=created_by)` – Controller gọi Repository, không gọi Service (với chức năng tạo đề hiện tại không có ExamService, chỉ có ExamRepository).
- **Chuyển về client:** `return jsonify({...}), 201` – server gửi response JSON và status code qua HTTP.

---

### 2.3 Repository – Thao tác database (Model + db)

**File:** `server/app/repositories/exam_repository.py`

```python
# Dòng 1-3: Import Model và db
from app.models.exam_model import Exam, Question, Option
from app.extensions.db import db

class ExamRepository:
    def create_full_exam(self, data, created_by=None):
        try:
            # --- 1. TẠO BẢN GHI EXAM ---
            new_exam = Exam(
                title=data['title'],
                description=data.get('description', ''),
                duration=int(data['duration']),
                created_by=created_by
            )
            db.session.add(new_exam)
            db.session.flush()   # Ghi xuống DB tạm để có new_exam.id

            # --- 2. DUYỆT CÂU HỎI, TẠO QUESTION ---
            for q_data in data.get('questions', []):
                new_question = Question(
                    exam_id=new_exam.id,
                    content=q_data['content'],
                    question_type=q_data.get('question_type', 'mcq'),
                    score=float(q_data.get('score', 1.0))
                )
                db.session.add(new_question)
                db.session.flush()   # Để có new_question.id

                # --- 3. NẾU LÀ TRẮC NGHIỆM, TẠO OPTION ---
                if new_question.question_type == 'mcq':
                    for opt_data in q_data.get('options', []):
                        new_option = Option(
                            question_id=new_question.id,
                            content=opt_data['content'],
                            is_correct=opt_data.get('is_correct', False)
                        )
                        db.session.add(new_option)

            # --- 4. COMMIT MỘT LẦN – Ghi hết vào database ---
            db.session.commit()
            return new_exam
        except Exception as e:
            db.session.rollback()
            raise e
```

- **Dữ liệu vào Repository:** `data` và `created_by` (từ Controller).
- **Chuyển sang Model + DB:** qua các class `Exam`, `Question`, `Option` (từ `exam_model`) và `db.session.add/flush/commit` (từ `app.extensions.db`). Không có Service ở giữa: Controller → Repository → Model + DB.
- **Chuyển ngược lên Controller:** `return new_exam` (object SQLAlchemy có `.id` sau khi commit).

---

### 2.4 Model – Định nghĩa bảng và quan hệ

**File:** `server/app/models/exam_model.py`

- `Exam`: bảng `exams`, có quan hệ `questions` (1-n), `created_by` → `users.id`.
- `Question`: bảng `questions`, `exam_id` → `exams.id`, có quan hệ `options` (1-n).
- `Option`: bảng `options`, `question_id` → `questions.id`.

Model không “gửi” dữ liệu; nó định nghĩa cấu trúc dữ liệu mà Repository dùng với `db.session`.

---

### 2.5 Extensions – Kết nối DB

**File:** `server/app/extensions/db.py`

```python
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()
```

- `db` được khởi tạo trong `app/__init__.py` bằng `db.init_app(app)` và dùng trong Repository qua `db.session`.

---

## BẢNG TÓM TẮT – Ai gọi ai, dữ liệu đi đâu

| Bước | Vị trí (file + dòng) | Ai gọi ai / Dữ liệu chuyển thế nào |
|------|----------------------|-------------------------------------|
| 1 | `client/app/exams/create/page.tsx` ~161-169 | User bấm Lưu → `handleSubmit()` gom `examInfo` + `questions` + `user.id` thành `payload`. |
| 2 | `client/app/exams/create/page.tsx` ~169 | `await apiClient.post("/api/exams/create", payload)` → **Client gửi dữ liệu qua HTTP** (body JSON). |
| 3 | `client/services/apiClient.ts` | `apiClient` (axios) gửi POST tới `baseURL + "/api/exams/create"`, thêm header Authorization nếu có. |
| 4 | `server/app/__init__.py` ~30 | Flask nhận request; `app.register_blueprint(exam_bp)` → route `POST /api/exams/create` do `exam_bp` xử lý. |
| 5 | `server/app/controllers/exam_controller.py` ~65-66 | `create_exam()`: `data = request.get_json()` → nhận đúng `payload` từ client. |
| 6 | `server/app/controllers/exam_controller.py` ~72 | **Controller gọi Repository:** `new_exam = exam_repo.create_full_exam(data, created_by=created_by)`. |
| 7 | `server/app/repositories/exam_repository.py` ~6-39 | **Repository** dùng `data` tạo object `Exam`, `Question`, `Option` và `db.session.add/flush/commit` → ghi DB. |
| 8 | `server/app/repositories/exam_repository.py` ~39 | `return new_exam` → trả object về Controller. |
| 9 | `server/app/controllers/exam_controller.py` ~73-80 | **Server gửi về client:** `return jsonify({"message": "...", "exam_id": new_exam.id}), 201`. |
| 10 | `client/app/exams/create/page.tsx` ~169-171 | Axios nhận response 201 → `alert("Tạo đề thi thành công!")` và `router.push('/home')`. |

---

## LƯU Ý VỀ KIẾN TRÚC

- **Client:** Trang tạo đề gọi thẳng `apiClient.post`; không có lớp `examService.createExam()` riêng cho tạo đề (các chức năng khác như list, get, start, submit có trong `examService.ts`).
- **Server:** Luồng tạo đề là **Controller → Repository → Model + DB**. Không có **Service** (BLL) giữa Controller và Repository cho hành động “create exam”; mọi logic tạo đề nằm trong Repository.

Nếu sau này bạn tách thêm lớp Service (ví dụ `ExamService.create_exam()`), luồng sẽ thành: Controller → Service → Repository → Model + DB; khi đó cần bổ sung tài liệu tương ứng.
