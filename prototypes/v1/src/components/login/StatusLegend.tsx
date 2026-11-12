import StatusBadge from "../StatusBadge";
import { STATUS_LABELS, type MangaStatus } from "../../data/statuses";

const statuses = Object.keys(STATUS_LABELS) as MangaStatus[];

export default function StatusLegend() {
    return (
        <div>
            <p className="mb-2.5 text-sm text-muted">Así verás la disponibilidad de cada manga:</p>
            <ul className="flex flex-wrap gap-2.5">
                {statuses.map((status) => (
                    <li key={status}>
                        <StatusBadge status={status} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
