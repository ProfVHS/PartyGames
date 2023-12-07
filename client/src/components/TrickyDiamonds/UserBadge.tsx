import React from "react";

interface UserBadgeProps {
  username: string;
}
export const UserBadge = ({ username }: UserBadgeProps) => {
  return <div className="tricky__badge">{username[0]}</div>;
};
