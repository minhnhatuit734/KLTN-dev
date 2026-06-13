from locust import HttpUser, task, between, LoadTestShape

class TravelWebsiteUser(HttpUser):
    """
    Mô phỏng hành vi của người dùng trên toàn bộ hệ thống Microservices:
    Tours, Blog, Reviews, Homepage (qua API Gateway).
    """
    wait_time = between(1.0, 5.0)

    @task(50)
    def view_homepage_and_tours(self):
        """Hành vi truy cập trang chủ và xem danh sách Tour"""
        self.client.get("/", name="GET / (Homepage)")
        self.client.get("/tours", name="GET /tours")

    @task(30)
    def read_blog(self):
        """Hành vi xem blog chia sẻ kinh nghiệm du lịch"""
        self.client.get("/blog/posts", name="GET /blog/posts")

    @task(5)
    def search_tour(self):
        """Mô phỏng hành vi tìm kiếm tour (tốn CPU/DB hơn)"""
        self.client.get("/tours?search=da+lat", name="GET /tours (Search)")


class StagesShape(LoadTestShape):
    """
    Tự động hóa 5 giai đoạn tải trong kịch bản thực nghiệm.
    Locust sẽ dựa vào thời gian chạy (run_time) để điều chỉnh tự động số lượng user.
    """
    
    # Tổng thời gian: ~15 phút (960 giây)
    stages = [
        {"duration": 180, "users": 50, "spawn_rate": 5},          # Giai đoạn 1 (0 -> 3 phút)
        {"duration": 360, "users": 200, "spawn_rate": 20},        # Giai đoạn 2 (3 -> 6 phút)
        {"duration": 600, "users": 500, "spawn_rate": 50},        # Giai đoạn 3 (6 -> 10 phút)
        {"duration": 780, "users": 1000, "spawn_rate": 100},      # Giai đoạn 4 (10 -> 13 phút)
        {"duration": 840, "users": 500, "spawn_rate": 100},       # Giai đoạn 5.1 - Giảm tải (13 -> 14 phút)
        {"duration": 900, "users": 200, "spawn_rate": 100},       # Giai đoạn 5.2 - Giảm tải (14 -> 15 phút)
        {"duration": 960, "users": 50, "spawn_rate": 50},         # Giai đoạn 5.3 - Giảm tải (15 -> 16 phút)
    ]

    def tick(self):
        run_time = self.get_run_time()

        for stage in self.stages:
            if run_time < stage["duration"]:
                return (stage["users"], stage["spawn_rate"])

        # Trả về None khi vượt qua tất cả các giai đoạn (kết thúc test)
        return None
