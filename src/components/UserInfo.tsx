import User from "../types/User";

type UserInfoProps = {
    user: User;
};

export default function UserInfo({ user }: UserInfoProps) {
    return <div>{user.fullname}</div>;
}
