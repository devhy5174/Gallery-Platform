/**
 * api
 * Supabase DB + Storage 연동 — 전시 저장/불러오기/이미지 업로드
 */

import { supabase } from "./supabase";
import type { ExhibitionData, ArtworkItem } from "../types";

// ── Storage 이미지 업로드 ────────────────────────────────────

async function uploadImage(exhibitionId: string, file: File, index: number): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${exhibitionId}/${index}.${ext}`;
  const { error } = await supabase.storage
    .from("gallery-images")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("gallery-images").getPublicUrl(path);
  return data.publicUrl;
}

// ── 전시 저장 (신규 생성 or 수정) ───────────────────────────

export async function saveExhibition(
  data: ExhibitionData,
  existingId?: string,
): Promise<string> {
  const { title, description, artworks } = data;

  // 1. exhibitions 행 생성 or 갱신
  let exhibitionId: string;
  if (existingId) {
    const { error } = await supabase
      .from("exhibitions")
      .update({ title, description })
      .eq("id", existingId);
    if (error) throw error;
    exhibitionId = existingId;

    // 기존 artworks 전부 삭제 후 재삽입 (순서 변경 반영)
    const { error: delError } = await supabase
      .from("artworks")
      .delete()
      .eq("exhibition_id", exhibitionId);
    if (delError) throw delError;
  } else {
    const { data: row, error } = await supabase
      .from("exhibitions")
      .insert({ title, description })
      .select("id")
      .single();
    if (error) throw error;
    exhibitionId = row.id;
  }

  // 2. 이미지 업로드 + artworks 삽입
  for (let i = 0; i < artworks.length; i++) {
    const artwork = artworks[i];

    let imageUrl = artwork.imageUrl;
    // blob URL이면 Storage에 업로드
    if (artwork.file && artwork.imageUrl.startsWith("blob:")) {
      imageUrl = await uploadImage(exhibitionId, artwork.file, i);
    }

    const { error } = await supabase.from("artworks").insert({
      exhibition_id: exhibitionId,
      slot_order: i,
      title: artwork.title || null,
      description: artwork.description || null,
      image_url: imageUrl,
    });
    if (error) throw error;
  }

  return exhibitionId;
}

// ── 전시 불러오기 ────────────────────────────────────────────

export async function loadExhibition(id: string): Promise<ExhibitionData> {
  const { data: exhibition, error: exError } = await supabase
    .from("exhibitions")
    .select("*")
    .eq("id", id)
    .single();
  if (exError) throw exError;

  const { data: artworkRows, error: awError } = await supabase
    .from("artworks")
    .select("*")
    .eq("exhibition_id", id)
    .order("slot_order", { ascending: true });
  if (awError) throw awError;

  const artworks: ArtworkItem[] = (artworkRows ?? []).map((row) => ({
    id: row.id,
    dbId: row.id,
    title: row.title ?? "",
    description: row.description ?? "",
    imageUrl: row.image_url,
    // file 없음 — Storage URL을 직접 사용
  }));

  return {
    title: exhibition.title,
    description: exhibition.description ?? "",
    artworks,
  };
}
