"use client";

interface Props {
  placeholder?: string;
  buttonLabel?: string;
  note?: string;
}

export default function EmailCapture({
  placeholder = "your@email.com",
  buttonLabel = "Notify me",
  note = "No spam. Unsubscribe anytime.",
}: Props) {
  return (
    <div>
      <form
        className="flex gap-2"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="email"
          placeholder={placeholder}
          className="input-field flex-1 text-sm"
        />
        <button type="submit" className="btn-primary text-sm px-4 whitespace-nowrap">
          {buttonLabel}
        </button>
      </form>
      {note && (
        <p className="text-xs text-gray-400 mt-2">{note}</p>
      )}
    </div>
  );
}
