"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "../modal/Modal";
import { ModalHeader } from "../modal/ModalHeader";
import { ModalBody } from "../modal/ModalBody";
import Input from "../input";
import { createClient } from "@/utils/supabase/client";
import { addPlace } from "@/api";
import type { SearchedPlace } from "@/utils/naver";
import { Button } from "../Button/Button";

import SearchIcon from "@/assets/icon/search-icon.svg";
import ExternalLink from "@/assets/icon/external-link.svg";
import Check from "@/assets/icon/check-icon.svg";

interface AddPlaceModalProps {
  meetupId: string;
  onClose: () => void;
}

export function AddPlaceModal({ meetupId, onClose }: AddPlaceModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchedPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedNames, setAddedNames] = useState<string[]>([]);
  const [pendingNames, setPendingNames] = useState<string[]>([]);
  const router = useRouter();

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsSearching(true);
    const res = await fetch(`/api/search?query=${encodeURIComponent(trimmed)}`);
    const data = await res.json();
    setResults(data.places ?? []);
    setIsSearching(false);
  };

  const handleAdd = async (place: SearchedPlace) => {
    //버튼 먼저 막기
    setPendingNames((prev) => [...prev, place.name]);
    try {
      const supabase = createClient();
      await addPlace(supabase, {
        meetupId,
        name: place.name,
        category: place.category,
        address: place.roadAddress || place.address,
        lat: place.lat,
        lng: place.lng,
      });
      setAddedNames((prev) => [...prev, place.name]);

      router.refresh();
    } catch (error) {
      console.error("담기 실패", error);
    } finally {
      setPendingNames((prev) => prev.filter((name) => name !== place.name));
    }
  };

  return (
    <Modal onClose={onClose} isDismissable>
      <ModalHeader>장소 추가하기</ModalHeader>
      <ModalBody className="gap-3 p-4">
        <div className="flex gap-2">
          <Input
            prefix={<SearchIcon className="w-4" />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="장소를 검색해보세요"
            className="flex-1"
          />
          <Button className="w-20" type="button" onClick={handleSearch} disabled={isSearching}>
            {isSearching ? "검색 중..." : "검색"}
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {results.map((place) => {
            const isAdded = addedNames.includes(place.name);
            return (
              <div
                key={`${place.name}-${place.address}`}
                className="flex items-center justify-between gap-2 border-b p-5 border-border-default "
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold">{place.name}</div>
                  <div className="truncate text-sm text-text-placeholder">
                    {place.roadAddress || place.address}
                  </div>
                  <a
                    href={`https://map.naver.com/p/search/${encodeURIComponent(`${place.name} ${place.address}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-placeholder text-sm pt-2 flex items-center gap-1"
                  >
                    <ExternalLink className="w-4" />
                    네이버 지도 바로가기
                  </a>
                </div>
                <Button
                  className="w-25 h-10"
                  type="button"
                  disabled={pendingNames.includes(place.name)}
                  onClick={() => handleAdd(place)}
                >
                  {isAdded ? (
                    <span className="flex items-center justify-center gap-1">
                      <Check className="w-4" />
                      담음
                    </span>
                  ) : (
                    "담기"
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </ModalBody>
    </Modal>
  );
}
