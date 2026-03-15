interface ProseProps {
    html: string;
}

/**
 * Renders raw semantic HTML from mammoth inside a prose container.
 * The .prose class (from @tailwindcss/typography) applies neo-brutalist
 * typographic defaults defined in globals.css.
 */
export default function Prose({ html }: ProseProps) {
    return (
        <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
