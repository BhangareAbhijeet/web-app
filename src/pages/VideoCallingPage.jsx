import { useSearchParams, useNavigate } from "react-router-dom";
import VoiceCall from "../components/VoiceCall";
import { useCall } from "../context/CallContext";
function VoiceCallPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { isCaller, otherUser, resetCall } = useCall();

  const user = searchParams.get("user");
  const target = searchParams.get("target");

  const targetName = otherUser?.name || target;

  console.log("📞 Voice Call User:", user);
  console.log("📞 Voice Call Target:", target);
  console.log("📞 Is Caller (from context):", isCaller);
  console.log("📞 Target Name:", targetName);

  if (!user || !target) {
    return <div>Invalid call information</div>;
  }

  return (
    <VoiceCall
      user={user}
      receiver={target}
      isCaller={isCaller}
      onEnd={() => {
        resetCall();
        navigate("/messages", { replace: true });
      }}
    />
  );
}

export default VoiceCallPage;
