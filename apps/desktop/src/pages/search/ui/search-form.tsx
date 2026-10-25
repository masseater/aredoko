import { Search } from "lucide-react";
import { useCallback } from "react";
import type { ChangeEvent, ReactNode, SubmitEvent } from "react";
import { Button } from "ui/button";

import { useDraft, useSetDraft, useSubmitQuery } from "#/pages/search/model";
import { Input } from "#/shared/ui/input";

const PLACEHOLDER = "黒い服、猫耳、ネイル";
const LABEL = "検索語";
const SUBMIT = "検索";

const SearchForm = (): ReactNode => {
  const draft = useDraft();
  const setDraft = useSetDraft();
  const submit = useSubmitQuery();
  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setDraft(event.target.value);
    },
    [setDraft],
  );
  const onSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      submit(draft);
    },
    [submit, draft],
  );
  return (
    <form className="flex gap-2" onSubmit={onSubmit}>
      <Input
        type="search"
        placeholder={PLACEHOLDER}
        aria-label={LABEL}
        value={draft}
        onChange={onChange}
      />
      <Button type="submit">
        <Search />
        {SUBMIT}
      </Button>
    </form>
  );
};

export { SearchForm };
