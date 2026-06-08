import { useState, useCallback, useMemo } from 'react';
import type { EventSeat } from '../../types';

interface Props {
  seats: EventSeat[];
  selectedSeats: string[];
  onToggleSeat: (seatId: string) => void;
  disabled?: boolean;
  liveUpdatedSeatIds?: Set<string>;
}

interface TooltipData {
  seat: EventSeat;
  x: number;
  y: number;
}

export default function SeatMap({ seats, selectedSeats, onToggleSeat, disabled, liveUpdatedSeatIds }: Props) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  // Group seats by section name then by row
  const sectionGroups = useMemo(() => {
    const groups: Record<string, Record<string, EventSeat[]>> = {};
    seats.forEach((seat) => {
      const sectionName = seat.sectionName || seat.seat?.section?.name || 'General';
      const row = seat.row || 'A';
      if (!groups[sectionName]) groups[sectionName] = {};
      if (!groups[sectionName][row]) groups[sectionName][row] = [];
      groups[sectionName][row].push(seat);
    });
    // Sort seats within each row
    Object.values(groups).forEach((rows) => {
      Object.values(rows).forEach((rowSeats) => {
        rowSeats.sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber));
      });
    });
    return groups;
  }, [seats]);

  const sectionNames = Object.keys(sectionGroups).sort();

  const getStatusClass = (seat: EventSeat): string => {
    if (selectedSeats.includes(seat.id)) return 'seat-selected';
    if (seat.status === 'AVAILABLE') return 'seat-available';
    if (seat.status === 'LOCKED') return 'seat-locked';
    return 'seat-booked';
  };

  const selectedCount = selectedSeats.length;

  return (
    <div className="seat-map-premium">
      {/* Legend */}
      <div className="seatmap-legend">
        <div className="seatmap-legend-item">
          <div className="seatmap-legend-swatch seatmap-swatch-available" />
          <span>Available</span>
        </div>
        <div className="seatmap-legend-item">
          <div className="seatmap-legend-swatch seatmap-swatch-selected" />
          <span>Selected ({selectedCount})</span>
        </div>
        <div className="seatmap-legend-item">
          <div className="seatmap-legend-swatch seatmap-swatch-locked" />
          <span>Locked</span>
        </div>
        <div className="seatmap-legend-item">
          <div className="seatmap-legend-swatch seatmap-swatch-booked" />
          <span>Booked</span>
        </div>
      </div>

      {/* Stage */}
      <div className="seatmap-stage">
        <div className="seatmap-stage-inner">
          <div className="seatmap-stage-glow" />
          <span>STAGE</span>
        </div>
      </div>

      {/* Sections */}
      {sectionNames.map((sectionName) => {
        const rows = sectionGroups[sectionName];
        const sortedRows = Object.keys(rows).sort();
        return (
          <div key={sectionName} className="seatmap-section">
            {sectionNames.length > 1 && (
              <div className="seatmap-section-header">
                <div className="seatmap-section-line" />
                <span className="seatmap-section-name">{sectionName}</span>
                <div className="seatmap-section-line" />
              </div>
            )}
            <div className="seatmap-grid">
              {sortedRows.map((row, rowIdx) => (
                <div key={row} className="seatmap-row" style={{ animationDelay: `${rowIdx * 40}ms` }}>
                  <span className="seatmap-row-label">{row}</span>
                  <div className="seatmap-row-seats">
                    {rows[row].map((seat, seatIdx) => {
                      const canSelect = seat.status === 'AVAILABLE' && !disabled;
                      const isSelected = selectedSeats.includes(seat.id);
                      return (
                        <div
                          key={seat.id}
                          className={[
                            'seatmap-seat',
                            getStatusClass(seat),
                            liveUpdatedSeatIds?.has(seat.id) ? 'seatmap-seat-live' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          style={{ animationDelay: `${rowIdx * 40 + seatIdx * 15}ms` }}
                          onClick={() => canSelect && onToggleSeat(seat.id)}
                          data-selectable={canSelect}
                          data-tooltip={`Row ${seat.row}, Seat ${seat.seatNumber}`}
                          data-tooltip-sub={`₹${parseFloat(seat.price).toLocaleString()} • ${isSelected ? 'Selected' : seat.status}`}
                        >
                          <span className="seatmap-seat-number">{seat.seatNumber}</span>
                          {isSelected && <div className="seatmap-seat-checkmark">✓</div>}
                        </div>
                      );
                    })}
                  </div>
                  <span className="seatmap-row-label">{row}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Flash animation for real-time seat updates */}
      <style>{`
        @keyframes seat-live-flash {
          0%   { box-shadow: 0 0 0 0 rgba(99, 179, 237, 0.8), 0 0 0 0 rgba(99, 179, 237, 0.4); }
          50%  { box-shadow: 0 0 0 6px rgba(99, 179, 237, 0.3), 0 0 12px 4px rgba(99, 179, 237, 0.2); }
          100% { box-shadow: 0 0 0 0 rgba(99, 179, 237, 0); }
        }
        .seatmap-seat-live {
          animation: seat-live-flash 0.6s ease-out 2 !important;
        }
      `}</style>
    </div>
  );
}
