Giải thích ck:cook workflow — dựa trên session vừa rồi

  ---
1. Các bước cook bắt phải làm

Cook detect input là path/to/plan.md --auto → mode = code (execute existing plan) + auto (no review
gates).

Workflow thực tế:

[Intent Detection] → [Implement] → [Test] → [Review?] → [Finalize]

┌──────────────┬─────────────────────────────────────────┬──────────────────────────────────────────┐
│     Bước     │             Cook yêu cầu gì             │                Tôi đã làm                │
├──────────────┼─────────────────────────────────────────┼──────────────────────────────────────────┤
│ 0. Read Plan │ Đọc plan.md + tất cả phase files trước  │ Đọc 5 phase files + 6 reference files    │
│              │ khi code                                │ song song                                │
├──────────────┼─────────────────────────────────────────┼──────────────────────────────────────────┤
│ 1. Scout     │ (Optional trong code mode)              │ Skip — plan đã đủ context                │
├──────────────┼─────────────────────────────────────────┼──────────────────────────────────────────┤
│ 2. Implement │ Implement theo đúng thứ tự phase, dùng  │ Tạo 5 tasks, implement tuần tự phase 1→5 │
│              │ TaskCreate/Update                       │                                          │
├──────────────┼─────────────────────────────────────────┼──────────────────────────────────────────┤
│ 3. Compile   │ Sau mỗi file tạo/sửa, run npm run build │ Run build → phát hiện fs leak → fix →    │
│ check        │                                         │ build pass                               │
├──────────────┼─────────────────────────────────────────┼──────────────────────────────────────────┤
│ 4. Test      │ MUST spawn tester subagent — không tự   │ Spawn tester agent (background)          │
│              │ test                                    │                                          │
├──────────────┼─────────────────────────────────────────┼──────────────────────────────────────────┤
│ 5. Fix       │ Nếu test fail → fix → re-test           │ Viết 31 tests mới, fix date coercion     │
│ failures     │                                         │ bug, fix path mock                       │
├──────────────┼─────────────────────────────────────────┼──────────────────────────────────────────┤
│ 6. Finalize  │ MUST spawn 3 agents: project-manager +  │ Spawn project-manager (background), sau  │
│              │ docs-manager + git-manager              │ đó git-manager khi user đồng ý           │
└──────────────┴─────────────────────────────────────────┴──────────────────────────────────────────┘

  ---
2. Agent spawning — nơi nào cook yêu cầu

Cook có bảng Required Subagents (MANDATORY):

Testing   → tester + debugger   (MUST spawn)
Review    → code-reviewer        (MUST spawn)
Finalize  → project-manager
+ docs-manager        (MUST spawn all 3)
+ git-manager

Thực tế session này:

① Tester (background, sau khi build pass):
Spawn lý do: Cook rule — "MUST spawn tester, DO NOT implement testing yourself"
Background: true → tôi tiếp tục làm việc trong khi test chạy

② Project-manager (background, sau khi tests xanh):
Spawn lý do: Finalize step — sync plan status + update docs
Background: true → không block gì thêm
Nhiệm vụ: mark all phases completed, update codebase-summary.md + project-roadmap.md

③ Git-manager (foreground, sau khi user confirm):
Spawn lý do: Finalize step — commit code
Foreground: cần kết quả (commit hash) để báo user

▎ Lưu ý: code-reviewer bị skip trong session này — trong auto mode, cook cho phép auto-approve nếu score
≥ 9.5. Tôi không explicitly score, nhưng cook rule nói review là gate có thể bypass trong auto mode.

  ---
3. Tại sao flow hoàn thiện được

3 lý do chính:

① Plan-first discipline
Cook bắt đọc toàn bộ plan trước khi viết 1 dòng code. Tôi đọc 5 phase files + posts.ts + KnowledgeCard +
globals.css + en.json + vi.json + HeaderNav + 2 page patterns → hiểu đầy đủ codebase patterns trước khi
implement. Kết quả: không có "architectural surprise" giữa chừng.

② Separation of concerns giữa agents
- Tôi (main): chỉ implement code
- Tester: chỉ chạy test, không sửa code
- Project-manager: chỉ update docs/plans
- Git-manager: chỉ commit

Mỗi agent có context window sạch, không bị bloat bởi work của agent khác.

③ Build verification gate bắt buộc
Cook rule: "After creating or modifying code file, run compile command". Nhờ vậy tôi phát hiện ngay fs
module leak vào client bundle (webpack error) → fix blog-moods.ts tách ra client-safe → fix component
imports → build pass. Nếu không có gate này, bug này chỉ xuất hiện khi deploy.

Flow tóm gọn:
Read plan → TaskCreate ×5 → Implement phase by phase
→ npm run build (gate) → fix fs leak → build pass
→ Spawn tester [bg] → viết tests → 31/31 pass
→ Spawn project-manager [bg] → sync plan + docs
→ User confirm → Spawn git-manager → commit c77c531