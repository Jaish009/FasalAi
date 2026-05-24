import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", alignItems: "center", justifyContent: "center", backgroundColor: "#fefae0" }}>
      <SignIn />
    </div>
  );
}
