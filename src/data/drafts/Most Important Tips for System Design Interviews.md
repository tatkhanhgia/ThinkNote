  
# Most Important Tips for System Design Interviews — Tóm tắt nhanh (VN)

  

*Nguồn gốc: System Design Codex — “Most Important Tips for System Design Interviews” (Sep 16, 2025).*

  

> Mục tiêu: tóm tắt **23 nguyên tắc** cốt lõi để xử lý interview system design và áp dụng thực tế. Mỗi mục: 1–2 ý chính + hình minh họa khi có.

  

---

  

## 0) Bức tranh tổng quan

```mermaid

flowchart LR

Req[Clarify Requirements]-->Scale[Scale Strategy]

Scale-->LB[Load Balancer]

Scale-->Auto[Autoscaling]

Scale-->CDN[CDN]

DB[(Database)]-->Idx[Indexing]

DB-->Repl[Read Replication]

DB-->Shard[Write Sharding]

Perf[Performance]-->Cache[Cache]

Perf-->Compress[Compression/Pagination]

Reliab[Reliability]-->SPOF[Remove SPoF]

Reliab-->Failover[Failover]

Pattern[Design & Process]-->EDA[Event-Driven]

Pattern-->NoSQL[NoSQL for unstructured]

Pattern-->CICD[CI/CD]

Collab[Interview Process]-->Listen[Listen & Record]

Collab-->Assump[Clarify assumptions]

Collab-->Feedback[Constant feedback]

Arch[Architecture Choice]-->Mono[Monolith OK]

Arch-->MS[Microservices for independent deploy]

Long[Long tasks]-->Async[Async/Queue]

Security[Abuse control]-->RateLimit[Rate Limiting]

```

*(Sơ đồ định hướng, không thay thế chi tiết triển khai.)*

  

---

  

## 1) Ưu tiên **Vertical scaling** rồi mới **Horizontal**

- Nâng cấp cấu hình 1 node trước; khi chi phí tăng dần/không hiệu quả → chuyển sang nhân bản ngang.

![Vertical vs Horizontal Scaling](https://substackcdn.com/image/fetch/%24s_%21dDSb%21%2Cw_1456%2Cc_limit%2Cf_auto%2Cq_auto%3Agood%2Cfl_progressive%3Asteep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1bc3bcc9-18a2-4228-9064-40e902d4cba0_4236x2405.png)

  

## 2) **Autoscaling** cho traffic spike

- Scale-out theo nhu cầu để tránh over‑provision.

![Auto Scaling](https://substackcdn.com/image/fetch/%24s_%21Ha1p%21%2Cw_1456%2Cc_limit%2Cf_auto%2Cq_auto%3Agood%2Cfl_progressive%3Asteep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F06de2823-3820-4dc2-a1f3-6d9a4356daa6_1905x1234.png)

  

## 3) **Load Balancer** cho HA + hiệu suất

- Phân phối request, tăng tính sẵn sàng.

![Load Balancer](https://substackcdn.com/image/fetch/%24s_%21lSCt%21%2Cw_1456%2Cc_limit%2Cf_auto%2Cq_auto%3Agood%2Cfl_progressive%3Asteep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb40b22a9-5b25-4727-b30f-e211632cef5b_2133x1280.png)

  

## 4) **Cache** cho hệ thống **read‑heavy**

- Không phải silver bullet, nhưng giúp giảm tải DB và “mua thời gian” tối ưu.

![DB Caching](https://substackcdn.com/image/fetch/%24s_%21VBG1%21%2Cw_1456%2Cc_limit%2Cf_auto%2Cq_auto%3Agood%2Cfl_progressive%3Asteep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa9513a19-0552-45c8-b8a3-c5bdc6ad31ba_2271x1379.png)

  

## 5) **Listen & Record**

- Lắng nghe yêu cầu, ghi chú lại – đây là “siêu năng lực” trong phỏng vấn.

  

## 6) Dùng **CDN** để giảm **latency**

- Phục vụ static gần user; hỗ trợ chống DDoS.

![CDN](https://substackcdn.com/image/fetch/%24s_%21rb_O%21%2Cw_1456%2Cc_limit%2Cf_auto%2Cq_auto%3Agood%2Cfl_progressive%3Asteep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F52a23755-4583-4877-bfae-f2645b8240dc_3864x4233.png)

  

## 7) Tạo **index** đúng

- Chiến lược index tốt nhiều khi loại bỏ nhu cầu cache.

  

## 8) **Replication** để scale **reads**

- Primary cho write; read‑replica cho đọc. Cân bằng HA vs consistency.

![Replication](https://substackcdn.com/image/fetch/%24s_%21FXLv%21%2Cw_1456%2Cc_limit%2Cf_auto%2Cq_auto%3Agood%2Cfl_progressive%3Asteep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff17fc347-7c10-4d24-ba1e-83d47acd4f9c_2699x1840.png)

  

## 9) **Sharding** để scale **writes**

- Chia bảng theo shard‑key → phân tán tải ghi.

![Sharding](https://substackcdn.com/image/fetch/%24s_%21buM6%21%2Cw_1456%2Cc_limit%2Cf_auto%2Cq_auto%3Agood%2Cfl_progressive%3Asteep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4ac5fd25-c299-49ed-99db-35222b9f5e54_2699x1747.png)

  

## 10) **Clarify assumptions**

- Trước khi vào solution, làm rõ giả định & boundary.

  

## 11) **Object Storage** cho dữ liệu phức tạp (video/image/file)

- Tận dụng dịch vụ của cloud provider.

  

## 12) **Rate limiting** để điều tiết usage

- Bảo vệ dịch vụ, chống lạm dụng/DoS.

![Rate Limiting](https://substackcdn.com/image/fetch/%24s_%21Obgr%21%2Cw_1456%2Cc_limit%2Cf_auto%2Cq_auto%3Agood%2Cfl_progressive%3Asteep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4407d759-527f-4aff-bfea-9c370fa55baa_2223x1438.png)

  

## 13) Loại bỏ **Single Point of Failure**

- Tăng **redundancy** (active‑passive/active‑active/multi‑active) & **isolation** (server→rack→DC→AZ→region).

![Redundancy & Isolation](https://substackcdn.com/image/fetch/%24s_%21JtWn%21%2Cw_1456%2Cc_limit%2Cf_auto%2Cq_auto%3Agood%2Cfl_progressive%3Asteep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F30b10f61-4ae5-4e28-879f-eb03b46ea245_2590x2815.png)

  

## 14) Đừng quên **Non‑Functional Requirements**

- Ví dụ: SLO latency, số user đồng thời… ảnh hưởng trực tiếp lựa chọn kiến trúc.

  

## 15) **Failover** để tăng fault‑tolerance

- Có cơ chế chuyển đổi khi node chính lỗi.

![Failover](https://substackcdn.com/image/fetch/%24s_%21yZ2g%21%2Cw_1456%2Cc_limit%2Cf_auto%2Cq_auto%3Agood%2Cfl_progressive%3Asteep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fec991c29-f0df-4182-a3f7-73aed116bc54_1905x1280.png)

  

## 16) **Long‑running task** → **Async/Queue**

- Tránh chặn UX; đẩy vào hàng đợi + worker.

![Async Processing](https://substackcdn.com/image/fetch/%24s_%2117TD%21%2Cw_1456%2Cc_limit%2Cf_auto%2Cq_auto%3Agood%2Cfl_progressive%3Asteep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92737d63-cf20-410e-b6cc-4ce8d5abadc9_3259x1957.png)

  

## 17) **Event‑Driven** để giảm coupling

- Tăng agility, giảm blast radius khi thay đổi.

  

## 18) **NoSQL** cho dữ liệu **unstructured/flexible schema**

- SQL & NoSQL ngày càng giao thoa, nhưng unstructured → NoSQL thường phù hợp.

  

## 19) **Constant feedback** trong buổi phỏng vấn

- Đối thoại 2 chiều, xin feedback liên tục thay vì chờ đến cuối.

  

## 20) **Compression & Pagination**

- Giảm băng thông, tối ưu chuyển dữ liệu lớn.

  

## 21) **CI/CD**

- Tự động build/deploy để tăng velocity và độ tin cậy.

  

## 22) **Microservices** cho **independent deployment**

- Monolith/modular monolith đi rất xa; nhưng cần tách deploy/scale riêng → microservices (đổi lại: độ phức tạp cao).

![Microservices](https://substackcdn.com/image/fetch/%24s_%21EZ3X%21%2Cw_1456%2Cc_limit%2Cf_auto%2Cq_auto%3Agood%2Cfl_progressive%3Asteep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe9507d12-d337-420a-90d6-06f1444cf833_3994x2419.png)

  

## 23) **Không có câu trả lời hoàn hảo**

- Luôn là bài toán **trade‑off**; quan trọng là lập luận và thích nghi.

  

---

  

### Ghi chú & công lao

- Bài gốc và hình minh họa: *System Design Codex – “Most Important Tips for System Design Interviews” (Saurabh Dashora, 2025-09-16).*

- Link bài gốc: https://newsletter.systemdesigncodex.com/p/most-important-tips-for-system-design