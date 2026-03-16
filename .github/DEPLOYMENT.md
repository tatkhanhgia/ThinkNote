# Hướng dẫn cấu hình CI/CD Deployment

## Tổng quan

Workflow CI/CD này sẽ tự động:
1. Chạy tests và lint khi có push
2. Build Next.js application
3. Deploy lên server qua SSH (Tailscale)
4. Restart PM2 service

## Cấu hình GitHub Secrets

Để workflow hoạt động, bạn cần cấu hình các secrets sau trong GitHub:

### Cách thêm Secrets:

1. Vào repository trên GitHub
2. Chọn **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Thêm từng secret sau:

### Danh sách Secrets cần thiết:

#### 1. `DEPLOY_HOST`
- **Mô tả**: Tailscale IP hoặc domain của server
- **Ví dụ**: `100.x.x.x` hoặc `your-server.tailscale.ts.net`
- **Lưu ý**: Không bao gồm `http://` hoặc `https://`

#### 2. `DEPLOY_USER`
- **Mô tả**: SSH username để kết nối đến server
- **Ví dụ**: `ubuntu`, `admin`, `root`, hoặc username của bạn

#### 3. `DEPLOY_SSH_KEY`
- **Mô tả**: SSH private key để xác thực
- **Cách lấy**:
  1. Trên máy local, kiểm tra xem đã có SSH key chưa:
     ```bash
     ls -la ~/.ssh/
     ```
  2. Nếu chưa có, tạo mới:
     ```bash
     ssh-keygen -t ed25519 -C "github-actions"
     ```
  3. Copy nội dung file private key (thường là `~/.ssh/id_ed25519`):
     ```bash
     cat ~/.ssh/id_ed25519
     ```
  4. Copy toàn bộ nội dung (bao gồm `-----BEGIN ...` và `-----END ...`)
  5. Thêm public key vào server:
     ```bash
     ssh-copy-id -i ~/.ssh/id_ed25519.pub $DEPLOY_USER@$DEPLOY_HOST
     ```
  6. Paste private key vào GitHub Secret `DEPLOY_SSH_KEY`

#### 4. `DEPLOY_PATH`
- **Mô tả**: Đường dẫn deploy trên server
- **Ví dụ**: `/var/www/my-knowledge-base` hoặc `/home/user/apps/my-knowledge-base`
- **Lưu ý**: Đảm bảo user có quyền ghi vào thư mục này

#### 5. `PM2_APP_NAME`
- **Mô tả**: Tên PM2 app để restart
- **Ví dụ**: `my-knowledge-base`
- **Lưu ý**: Tên này phải khớp với tên app trong PM2 trên server

## Kiểm tra cấu hình trên Server

### 1. Cài đặt Node.js và PM2

```bash
# Cài đặt Node.js (nếu chưa có)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài đặt PM2
sudo npm install -g pm2

# Khởi động PM2 khi boot
pm2 startup
```

### 2. Tạo thư mục deploy

```bash
sudo mkdir -p /var/www/my-knowledge-base
sudo chown -R $USER:$USER /var/www/my-knowledge-base
```

### 3. Cấu hình PM2 ecosystem (tùy chọn)

Tạo file `ecosystem.config.js` trong thư mục project:

```javascript
module.exports = {
  apps: [{
    name: 'my-knowledge-base',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/my-knowledge-base',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

Sau đó start với:
```bash
pm2 start ecosystem.config.js
```

## Workflow Triggers

Workflow sẽ tự động chạy khi:
- **Push vào branch `main` hoặc `master`**: Tự động deploy
- **Manual trigger**: Vào tab **Actions** > Chọn workflow > **Run workflow**

## Troubleshooting

### Lỗi SSH connection
- Kiểm tra `DEPLOY_HOST` và `DEPLOY_USER` đúng chưa
- Kiểm tra SSH key đã được thêm vào server chưa
- Test SSH connection thủ công:
  ```bash
  ssh -i ~/.ssh/your_key $DEPLOY_USER@$DEPLOY_HOST
  ```

### Lỗi PM2 restart
- Kiểm tra app name trong PM2:
  ```bash
  pm2 list
  ```
- Đảm bảo `PM2_APP_NAME` secret khớp với tên trong PM2

### Lỗi permission
- Kiểm tra quyền ghi vào `DEPLOY_PATH`:
  ```bash
  ls -la $DEPLOY_PATH
  ```
- Nếu cần, thay đổi owner:
  ```bash
  sudo chown -R $USER:$USER $DEPLOY_PATH
  ```

### Lỗi build
- Kiểm tra Node.js version trên server (nên >= 20)
- Kiểm tra log trong GitHub Actions để xem chi tiết lỗi

## Tùy chỉnh thêm

### Thêm environment variables

Nếu cần thêm environment variables cho production, tạo file `.env.production` trên server hoặc sử dụng PM2 ecosystem config.

### Backup trước khi deploy

Có thể thêm step backup vào workflow:

```yaml
- name: Backup current deployment
  run: |
    ssh ${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }} \
      "cd ${{ secrets.DEPLOY_PATH }} && tar -czf ../backup-$(date +%Y%m%d-%H%M%S).tar.gz ."
```

### Health check sau deploy

Có thể thêm health check:

```yaml
- name: Health check
  run: |
    sleep 5
    curl -f http://${{ secrets.DEPLOY_HOST }}:3000 || exit 1
```

## Liên hệ

Nếu gặp vấn đề, kiểm tra:
1. GitHub Actions logs trong tab **Actions**
2. PM2 logs trên server: `pm2 logs my-knowledge-base`
3. Server logs nếu có cấu hình logging

