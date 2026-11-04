import { STATUS_CLASSES, STATUS_LABELS, type MangaStatus } from "../data/statuses";

interface Props {
    status: MangaStatus;
}

export default function StatusBadge({ status }: Props) {
    return (
        <span className={`rounded-full border border-current px-3.5 py-1 text-xs ${STATUS_CLASSES[status]}`}>
            {STATUS_LABELS[status]}
        </span>
    );
}
