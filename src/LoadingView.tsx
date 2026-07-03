const LoadingView: React.FC =() => {
    return(<div className="flex-1 flex flex-col items-center justify-center space-y-10 py-32">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-red-500/10 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-red-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center"><i className="fa-solid fa-hands-praying text-red-500 text-3xl animate-pulse"></i></div>
        </div>
        <div className="text-center animate-fadeIn">
          <p className="text-2xl font-black tracking-tighter text-white italic">WEMISSION</p>
          <p className="text-sm text-gray-500 mt-3 font-light">기다림 속에 역사하시는 주님을 기대합니다...</p>
        </div>
    </div>);
}
export default LoadingView;