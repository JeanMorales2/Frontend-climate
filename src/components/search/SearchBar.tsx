"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LoaderCircle, Search, X } from "lucide-react";
import { useCitySuggestions } from "@/hooks/useCitySuggestions";
import type { CitySuggestion, Language } from "@/types/weather";
import { translate } from "@/lib/i18n";

type SearchBarProps = {
  language: Language;
  onSearch: (city: string) => void;
  loading?: boolean;
  error?: boolean;
};

export function SearchBar({ language, onSearch, loading = false, error = false }: SearchBarProps) {
  const [value, setValue] = useState("");
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const suggestions = useCitySuggestions(value);
  const items = suggestions.data ?? [];

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!formRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActive(-1);
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  useEffect(() => {
    const shortcut = (event: KeyboardEvent | globalThis.KeyboardEvent) => {
      if (
        (event.key === "/" && !(event.target instanceof HTMLInputElement)) ||
        (event.ctrlKey && event.key.toLowerCase() === "k")
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const selected = active >= 0 ? items[active] : undefined;
    const city = selected
      ? `${selected.name}${selected.state ? `, ${selected.state}` : ""}, ${selected.country}`
      : value.trim();
    if (!city) return;
    onSearch(city);
    setValue(city);
    setOpen(false);
    setActive(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && items.length) {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index + 1) % items.length);
    } else if (event.key === "ArrowUp" && items.length) {
      event.preventDefault();
      setActive((index) => (index <= 0 ? items.length - 1 : index - 1));
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    } else if (event.key === "Enter") {
      submit(event);
    }
  }

  return (
    <form ref={formRef} className="search-form" onSubmit={submit}>
      <div className="search-label">
        <label htmlFor="city-search">{translate(language, "searchLabel")}</label>
      </div>
      <div className="search-wrap">
        <div className={`search-box${error ? " has-error" : ""}`}>
          <Search className="search-icon" size={19} aria-hidden="true" />
          <input
            ref={inputRef}
            id="city-search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open && items.length > 0}
            aria-controls="city-suggestions"
            aria-activedescendant={active >= 0 ? `suggestion-${active}` : undefined}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={handleKeyDown}
            placeholder={translate(language, "placeholder")}
            autoComplete="off"
          />
          <span className="search-shortcut" aria-label={translate(language, "shortcutHint")}>
            <kbd>/</kbd>
          </span>
          {value && (
            <button
              className="clear-button"
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={() => {
                setValue("");
                setActive(-1);
                inputRef.current?.focus();
              }}
            >
              <X size={17} />
            </button>
          )}
          <button type="submit" disabled={!value.trim() || loading}>
            <span>{translate(language, "search")}</span>
            {loading ? (
              <LoaderCircle
                className="search-spinner"
                size={17}
                aria-label={translate(language, "loading")}
              />
            ) : (
              <Search size={17} aria-hidden="true" />
            )}
          </button>
        </div>
        <AnimatePresence>
          {open && items.length > 0 && (
            <motion.ul
              id="city-suggestions"
              className="suggestions"
              role="listbox"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              {items.map((item: CitySuggestion, index) => (
                <li key={`${item.lat}-${item.lon}`}>
                  <button
                    id={`suggestion-${index}`}
                    type="button"
                    role="option"
                    aria-selected={index === active}
                    className={index === active ? "active" : ""}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setActive(-1);
                      const city = `${item.name}${item.state ? `, ${item.state}` : ""}, ${item.country}`;
                      setValue(city);
                      onSearch(city);
                      setOpen(false);
                    }}
                  >
                    <span>
                      {item.name}
                      {item.state ? `, ${item.state}` : ""}
                    </span>
                    <small>{item.country}</small>
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
