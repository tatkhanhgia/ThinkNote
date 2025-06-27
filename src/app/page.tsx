export default function HomePage() {
  return (
    <div className="text-center py-10 px-4"> {/* Thêm padding ngang cho màn hình nhỏ */}
      <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
        Welcome to My Programming Knowledge Base
      </h1>
      <p className="text-lg sm:text-xl text-white text-opacity-90 mb-8"> {/* Điều chỉnh kích thước chữ p */}
        Discover insights, tutorials, and code snippets accumulated over years of learning and practice.
      </p>
      <button className="bg-white text-purple-600 font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-purple-100 transition duration-300">
        Explore Topics
      </button>
    </div>
  );
}