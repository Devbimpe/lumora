export default function ProfileSummaryCard({ personalInfo }) {
    if (!personalInfo) return null;
    const { fullName, userName, pronouns, headline, bio } = personalInfo;

    const initials = fullName
                    ? fullName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                    : "NA";

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start gap-6 mb-8" >
      {/* Avatar */}
      <div className="w-20 h-20 rounded-full bg-green-700 text-white flex items-center justify-center text-2xl font-bold">
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1" style={{ maxWidth: "70%" }}>
        <h2 className="text-2xl font-semibold text-green-900">{fullName || "Unnamed User"}</h2>

        <p className="text-gray-600 mt-2">{headline || "No headline provided"}</p>

        <div className="flex gap-2 mt-2">
          {userName && (
            <span className="bg-green-100 px-3 py-1 rounded-full text-sm">
              @{userName}
            </span>
          )}
          {pronouns && (
            <span className="bg-green-100 px-3 py-1 rounded-full text-sm">
              {pronouns}
            </span>
          )}
        </div>

        {bio && <p className="text-gray-700 mt-3">{bio}</p>}
      </div>
    </div>
  );
}


