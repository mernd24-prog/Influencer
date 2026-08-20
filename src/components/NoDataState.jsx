import noDataImage from "../assets/noData.png";

export default function NoDataState({
  message = "No data available",
  className = "",
}) {
  return (
    <div
      className={`flex min-h-[220px] flex-col items-center justify-center gap-3 py-6 text-center ${className}`}
    >
      <img
        src={noDataImage}
        alt="No data available"
        className="h-25 w-25 object-contain"
      />

      <p className="m-0 text-[12px] font-medium text-gray-500">
        {message}
      </p>
    </div>
  );
}