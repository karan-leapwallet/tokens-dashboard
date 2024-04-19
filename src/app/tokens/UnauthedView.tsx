import axios from "axios";
import { AWS_API_URL } from "../utils/constant";
import { useCallback } from "react";

type Props = {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setIsAuthed: React.Dispatch<React.SetStateAction<boolean>>;
};

// Login Page
const UnauthedView = ({ input, setInput, setIsAuthed }: Props) => {
  const onVerifyClick = useCallback(async () => {
    try {
      const res = await axios.get(AWS_API_URL, {
        headers: {
          "x-api-key": input,
        },
      });

      if (res.status === 200) {
        setIsAuthed(true);
        return;
      }
    } catch (e) {
      console.error(e);
    }
    setIsAuthed(false);
  }, [input, setIsAuthed]);

  return (
    <div className="flex flex-col justify-center items-center gap-4 mt-[223px]">
      <div className="text-xl font-bold text-black mb-6">Login</div>
      <input
        type="password"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="p-2 border-2 border-slate-300 rounded-lg"
        placeholder="Enter API Key..."
      />
      <button
        onClick={onVerifyClick}
        className="bg-blue-600 text-white px-6 h-[40px] rounded-lg"
      >
        Verify
      </button>
    </div>
  );
};

export default UnauthedView;
