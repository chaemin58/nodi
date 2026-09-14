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

const CATEGORIES = ["밥", "술", "카페", "기타"] as const;

// 같은 이름의 다른 지점(체인점 등)이 같이 검색될 수 있어 이름만으로는 구분이 안 됨.
function placeKey(place: SearchedPlace): string {
  return `${place.name}-${place.address}`;
}

export function AddPlaceModal({ meetupId, onClose }: AddPlaceModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchedPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedKeys, setAddedKeys] = useState<string[]>([]);
  const [pendingKeys, setPendingKeys] = useState<string[]>([]);
  const [categoryOpenFor, setCategoryOpenFor] = useState<string>();
  const [selectedCategory, setSelectedCategory] = useState<Record<string, string>>({});
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
    const key = placeKey(place);
    //버튼 먼저 막기
    setPendingKeys((prev) => [...prev, key]);
    try {
      const supabase = createClient();
      await addPlace(supabase, {
        meetupId,
        name: place.name,
        category: selectedCategory[key],
        address: place.roadAddress || place.address,
        lat: place.lat,
        lng: place.lng,
      });

      setAddedKeys((prev) => [...prev, key]);
      setCategoryOpenFor("");

      router.refresh();
    } catch (error) {
      console.error("담기 실패", error);
    } finally {
      setPendingKeys((prev) => prev.filter((k) => k !== key));
    }
  };

  return (
    <Modal onClose={onClose} isDismissable>
      <ModalHeader className="font-bold md:text-lg">장소 추가하기</ModalHeader>
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
            const key = placeKey(place);
            const isAdded = addedKeys.includes(key);
            const isPending = pendingKeys.includes(key);
            const isCategoryOpen = categoryOpenFor === key;
            return (
              <div
                key={`${place.name}-${place.address}`}
                className="border-b p-5 border-border-default"
              >
                <div className="flex items-center justify-between gap-2">
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
                  {!isCategoryOpen && (
                    <Button
                      className="w-25 h-10"
                      type="button"
                      disabled={isAdded || isPending}
                      onClick={() => setCategoryOpenFor(key)}
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
                  )}
                </div>

                {isCategoryOpen && !isAdded && (
                  <div className="mt-3 rounded-xl bg-gray-25 p-3">
                    <div className="mb-2 text-sm text-text-placeholder">
                      카테고리를 선택해주세요
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map((category) => {
                        const isSelected = selectedCategory[key] === category;
                        return (
                          <button
                            key={category}
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              setSelectedCategory((prev) => ({ ...prev, [key]: category }))
                            }
                            className={`rounded-full border px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
                              isSelected
                                ? "border-primary bg-primary-tinted text-primary"
                                : "border-border-default text-text-secondary"
                            }`}
                          >
                            {category}
                          </button>
                        );
                      })}
                    </div>
                    <Button
                      className="mt-3 h-10"
                      type="button"
                      disabled={!selectedCategory[key] || isPending}
                      onClick={() => handleAdd(place)}
                    >
                      담기
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ModalBody>
    </Modal>
  );
}
