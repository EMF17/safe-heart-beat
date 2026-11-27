/** Never discard the credential needed for deletion before the server succeeds. */
export async function deletePulseData(
  storage: Pick<Storage, "length" | "key" | "getItem" | "removeItem">,
  deleteRemote: (token: string) => Promise<unknown>,
) {
  const token = storage.getItem("pulse:syncToken");
  if (token) await deleteRemote(token);
  const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i));
  for (const key of keys) if (key?.startsWith("pulse:")) storage.removeItem(key);
}