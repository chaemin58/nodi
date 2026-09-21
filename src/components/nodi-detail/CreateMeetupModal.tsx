"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "../modal";
import Input from "../input";

import NonCheckSquare from "@/assets/icon/NonCheckSquare.svg";
import CheckSquare from "@/assets/icon/CheckSquare.svg";
import CircleCheckIcon from "@/assets/icon/CircleCheckIcon.svg";
import { Button } from "../Button/Button";

interface CreateMeetupModalProps {
  onClose: () => void;
  groupId: string;
}

export function CreateMeetupModal({ onClose, groupId }: CreateMeetupModalProps) {
  const router = useRouter();
  const [isDateUndecided, setIsDateUndecided] = useState(false);
  const [meetupTitle, setMeetupTitle] = useState<string>("");
  const [meetDate, setMeetDate] = useState<string>("");
  const [dateError, setDateError] = useState<string>("");
  const [titleError, setTitleError] = useState<string>("");
  const [step, setStep] = useState<"first" | "second">("first");
  // 생성된 약속 id — 안내 모달의 "약속 보러가기" 에서 쓴다.
  const [createdMeetupId, setCreatedMeetupId] = useState<string | null>(null);

  const handleSubmit = async () => {
    let hasError = false;
    if (!meetupTitle.trim()) {
      setTitleError("약속 이름을 작성해주세요");
      hasError = true;
    }

    if (!isDateUndecided && !meetDate) {
      setDateError("날짜를 선택하거나 체크박스를 확인해주세요.");
      hasError = true;
    }
    if (hasError) return;
    //제출
    const res = await fetch("/api/meetups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // 날짜 미정 체크 시엔 날짜를 보내지 않는다 (서버에서 null 로 저장).
      body: JSON.stringify({
        groupId,
        title: meetupTitle,
        meetDate: isDateUndecided ? null : meetDate,
      }),
    });

    if (!res.ok) return;

    const { id } = await res.json();
    setCreatedMeetupId(id);

    // 서버 컴포넌트(진행 중인 약속 목록)를 다시 읽어 새 약속이 바로 보이게 한다.
    router.refresh();

    //안내 모달로 넘기기
    setStep("second");
  };

  if (step === "second") {
    return (
      <Modal onClose={onClose} isDismissable={false}>
        <Modal.Body className="flex flex-col gap-4 ">
          <CircleCheckIcon className="w-10 mx-auto" />
          <div className="font-semibold mx-auto">성공적으로 생성되었습니다.</div>
        </Modal.Body>
        <Modal.Footer className="flex gap-2">
          <Button variant="secondary" onClick={onClose}>
            확인
          </Button>
          {/* TODO: 약속 상세 페이지가 생기면 createdMeetupId 로 이동 */}
          <Button variant="primary" disabled={!createdMeetupId}>
            약속 보러가기
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} isDismissable={true}>
      <Modal.Header className="font-semibold text-xl">
        <div className="mx-auto">약속 만들기</div>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        <Input
          placeholder="약속 이름을 작성해주세요"
          label="약속 이름"
          required
          value={meetupTitle}
          onChange={(e) => {
            setMeetupTitle(e.target.value);
            if (titleError) setTitleError("");
          }}
          isWarning={!!titleError}
          warningText={titleError}
        />
        <Input
          placeholder="날짜를 선택해주세요"
          label="만날 날짜"
          type="date"
          disabled={isDateUndecided}
          value={meetDate}
          onChange={(e) => {
            setMeetDate(e.target.value);
            if (dateError) setDateError("");
          }}
          isWarning={!!dateError}
          warningText={dateError}
        />
        <div className="flex gap-1">
          {isDateUndecided ? (
            <CheckSquare
              className="cursor-pointer"
              onClick={() => {
                setIsDateUndecided(false);
              }}
            />
          ) : (
            <NonCheckSquare
              className="cursor-pointer"
              onClick={() => {
                setIsDateUndecided(true);
                setDateError("");
              }}
            />
          )}{" "}
          아직 날짜를 못 정했어요.
        </div>
      </Modal.Body>
      <Modal.Footer className="flex gap-2">
        <Button variant="secondary" onClick={onClose}>
          취소
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          확인
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
