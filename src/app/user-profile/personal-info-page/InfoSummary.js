export default function ProfileSummaryCard({ personalInfo }) {
  if (!personalInfo) return null;

  // Extract personal information fields
  const { pronouns, headline, bio, name, username } = personalInfo;

  const displayName = name || personalInfo?.fullName || "Unnamed User";
  const displayUsername = username || personalInfo?.userName || "";

  // Generate initials for avatar
  const initials =
    displayName && displayName !== "Unnamed User"
      ? displayName
          .split(" ")
          .map(w => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "NA";

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 flex items-start gap-8 mb-8">

      {/* Avatar circle */}
      <div className="w-24 h-24 rounded-full bg-green-700 text-white flex items-center justify-center text-3xl font-bold shrink-0">
        {initials}
      </div>

      {/* Profile Info */}
      <div className="flex-1 space-y-2">
        
        {/* Full name */}
        <h2 className="!text-green-700 font-bold text-4xl mb-2">
            {displayName || "Unnamed User"}
        </h2>

        {/* Headline */}
        <p className="text-lg text-gray-600">
          {headline || "No headline provided"}
        </p>

        {/* Username + Pronouns */}
        <div className="mt-3">
          {displayUsername && (
            <span className="bg-green-100/70 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium inline-block">
              @{displayUsername}
            </span>
          )}
          {pronouns && (
            <span className="bg-green-100 px-3 py-1 rounded-full text-sm inline-block ml-2">
              {pronouns}
            </span>
          )}
        </div>

        {/* Bio */}
        {bio && <p className="italic text-gray-700 mt-4 text-[17px] leading-relaxed">{bio}</p>}
      </div>
    </div>
  );
}
