# Hướng dẫn viết Markdown cho nội dung tin tức

## 📝 Cú pháp Markdown cơ bản

### 1. Tiêu đề (Headings)

```markdown
# Tiêu đề cấp 1
## Tiêu đề cấp 2
### Tiêu đề cấp 3
#### Tiêu đề cấp 4
```

### 2. Định dạng văn bản

```markdown
**In đậm** hoặc __In đậm__
*In nghiêng* hoặc _In nghiêng_
***In đậm và nghiêng***
~~Gạch ngang~~
```

**Kết quả:**
- **In đậm**
- *In nghiêng*
- ***In đậm và nghiêng***
- ~~Gạch ngang~~

### 3. Danh sách

**Danh sách không thứ tự:**
```markdown
- Item 1
- Item 2
  - Sub item 2.1
  - Sub item 2.2
- Item 3
```

**Danh sách có thứ tự:**
```markdown
1. Bước đầu tiên
2. Bước thứ hai
3. Bước thứ ba
```

### 4. Liên kết (Links)

```markdown
[Văn bản hiển thị](https://example.com)
[MathFun Website](https://mathfun.vn)
```

### 5. Hình ảnh

```markdown
![Mô tả ảnh](http://171.244.140.108:1337/uploads/exam_question_40e1238e93.webp)
```

**Lưu ý:** URL ảnh phải là đường dẫn đầy đủ từ Strapi.

### 6. Video YouTube

Chỉ cần dán link YouTube, hệ thống sẽ tự động chuyển thành video embed:

```markdown
https://www.youtube.com/watch?v=VIDEO_ID
hoặc
https://youtu.be/VIDEO_ID
```

### 7. Trích dẫn (Blockquote)

```markdown
> Đây là một đoạn trích dẫn
> Có thể nhiều dòng
```

### 8. Code

**Inline code:**
```markdown
Sử dụng `console.log()` để in ra console
```

**Code block:**
```markdown
```javascript
function hello() {
  console.log("Hello World!");
}
```
```

### 9. Bảng (Tables)

```markdown
| Cột 1 | Cột 2 | Cột 3 |
|-------|-------|-------|
| Dữ liệu 1 | Dữ liệu 2 | Dữ liệu 3 |
| Dữ liệu 4 | Dữ liệu 5 | Dữ liệu 6 |
```

### 10. Đường kẻ ngang

```markdown
---
hoặc
***
```

## 📚 Ví dụ nội dung hoàn chỉnh

```markdown
## Tổng hợp Câu Cuối HK1 Toán Lớp 6 + Đáp Án

Tài liệu bao gồm hệ thống câu cuối từ đề kiểm tra học kỳ 1 của nhiều trường khác nhau, phân loại theo dạng:

### Các dạng bài tập chính

1. **Dãy lũy thừa và tổng đặc biệt**
   - Bài tập về lũy thừa
   - Tính tổng các số

2. **Tìm số nguyên / số tự nhiên thỏa mãn điều kiện**

3. **Hai số nguyên tố cùng nhau**

4. **Bài toán chia hết – chia có dư**

5. **Bài toán ứng dụng thực tế**

---

### Hình ảnh minh họa

![Đề thi mẫu](http://171.244.140.108:1337/uploads/exam_question_40e1238e93.webp)

### Video hướng dẫn

https://www.youtube.com/watch?v=dQw4w9WgXcQ

> **Lưu ý quan trọng:** Trong file có hướng dẫn giải chi tiết, lập luận từng bước, phù hợp cho giáo viên sử dụng trên lớp hoặc học sinh tự học tại nhà.

Để tải tài liệu, vui lòng [nhấn vào đây](#).

**Chúc các em học tốt!** 🎓
```

## 🎨 Các tính năng được hỗ trợ

✅ Tiêu đề (H1-H6)
✅ In đậm, in nghiêng, gạch ngang
✅ Danh sách có thứ tự và không thứ tự
✅ Liên kết
✅ Hình ảnh (tự động responsive)
✅ Video YouTube (tự động embed)
✅ Trích dẫn
✅ Code inline và code block
✅ Bảng
✅ Đường kẻ ngang

## 💡 Tips & Tricks

1. **Xuống dòng:** Thêm 2 dấu cách ở cuối dòng hoặc để trống 1 dòng
2. **Emoji:** Có thể dùng emoji trực tiếp: 🎉 📚 💡 ⭐
3. **Link ảnh từ Strapi:** Luôn dùng full URL kèm domain
4. **Video:** Chỉ cần paste link YouTube, không cần markdown image syntax

## ⚠️ Lưu ý

- Strapi Rich Text Markdown không hỗ trợ HTML trực tiếp
- Nên dùng cú pháp Markdown thuần để đảm bảo tương thích
- Test trước khi publish để đảm bảo hiển thị đúng
