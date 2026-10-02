"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setMeetupDate } from "@/api";
import { createClient } from "@/utils/supabase/client";
import { Button } from "../Button/Button";
import Input from "../input";
import { Modal } from "../modal";

interface SetMeetDateModalProps {
  meetupId: string;
  // 이미 정해진 날짜가 있으면 채워서 보여준다 (날짜 변경용)
  date?: string | null;
  onClose: () => void;
}

export function SetMeetDateModal({ meetupId, date, onClose }: SetMeetDateModalProps) {
  const router = useRouter();
  const [meetDate, setMeetDate] = useState<string>(date ?? "");
  const [dateError, setDateError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!meetDate) {
      setDateError("날짜를 선택해주세요.");
      return;
    }
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await setMeetupDate(createClient(), meetupId, meetDate);
      // 서버 컴포넌트(약속 상세 헤더)를 다시 읽어 새 날짜가 바로 보이게 한다.
      router.refresh();
      onClose();
    } catch (error) {
      console.error("날짜 설정 오류", error);
      setDateError("날짜 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} isDismissable>
      <Modal.Header className="font-semibold text-xl">
        <div className="mx-auto">날짜 정하기</div>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        <Input
          label="만날 날짜"
          type="date"
          value={meetDate}
          onChange={(e) => {
            setMeetDate(e.target.value);
            if (dateError) setDateError("");
          }}
          isWarning={!!dateError}
          warningText={dateError}
        />
      </Modal.Body>
      <Modal.Footer className="flex gap-2">
        <Button variant="secondary" onClick={onClose}>
          취소
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
          확인
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
