"use client";
import { CheckIcon, CopyIcon, Volume2, VolumeOff } from "lucide-react";
import { useState } from "react";
import { useSpeechSynthesis } from "react-speech-kit";
import ActionTooltip from "../ActionTooltip";

interface AnswerIconsProps {
  answer: string;
}

const AnswerIcons = ({ answer }: AnswerIconsProps) => {
  const [copied, setCopied] = useState(false);
  const { speak, cancel, speaking } = useSpeechSynthesis();

  function onCopy() {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }

  function speech() {
    speak({ text: answer });
  }
  return (
    <div className="flex gap-x-4 ml-9 mb-6 items-center justify-start">
      {!speaking ? (
        <ActionTooltip label="Speak">
          <Volume2
            size={25}
            className="cursor-pointer"
            onClick={speech}
          />
        </ActionTooltip>
      ) : (
        <ActionTooltip label="Mute">
          <VolumeOff
            size={25}
            className="cursor-pointer"
            onClick={() => cancel()}
          />
        </ActionTooltip>
      )}
      {!copied ? (
        <ActionTooltip label="Copy to Clipboard">
          <CopyIcon
            size={20}
            className="cursor-pointer transition"
            onClick={onCopy}
          />
        </ActionTooltip>
      ) : (
        <CheckIcon
          size={20}
          className="cursor-pointer transition"
        />
      )}
      {/* <ActionTooltip label="Regenerate">
        <RefreshCcw
          size={20}
          className="cursor-pointer"
        />
      </ActionTooltip> */}
    </div>
  );
};

export default AnswerIcons;
