"use client";

export function AvatarInitials({ name, size = 40, className = "" }) {
  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate a consistent color based on name
  const getColor = (name) => {
    const colors = [
      { bg: "bg-indigo-500", text: "text-white" },
      { bg: "bg-emerald-500", text: "text-white" },
      { bg: "bg-pink-500", text: "text-white" },
      { bg: "bg-blue-500", text: "text-white" },
      { bg: "bg-purple-500", text: "text-white" },
      { bg: "bg-teal-500", text: "text-white" },
      { bg: "bg-rose-500", text: "text-white" },
      { bg: "bg-amber-500", text: "text-white" },
    ];
    
    // Simple hash function to get consistent color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const initials = getInitials(name);
  const color = getColor(name);

  return (
    <div
      className={`${color.bg} ${color.text} rounded-full flex items-center justify-center font-semibold border-2 border-primary/20 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

