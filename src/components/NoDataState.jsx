import noDataImage from "../assets/noData.png";

export default function NoDataState({
  message = "No data available",
  className = "",
}) {
  return (
    <div
      className={`flex min-h-[240px] flex-col items-center justify-center gap-3 py-7 text-center ${className}`}
    >
      <img
        src={noDataImage}
        alt="No data available"
        className="h-28 w-28 object-contain sm:h-32 sm:w-32"
      />

      <p className="m-0 text-[12px] font-medium text-gray-500">
        {message}
      </p>
    </div>
  );
}
