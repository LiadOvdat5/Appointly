import { useCurrency, CURRENCY_SYMBOLS, type CurrencyCode } from "../../hooks/useCurrency";

interface Props {
  amount: number;
  businessCurrency: CurrencyCode;
  className?: string;
}

/**
 * Shows a price in the business currency.
 * If the viewer's preferred currency differs, appends a smaller estimated
 * conversion in parentheses: e.g.  $20  (~₪74.1)
 */
export function PriceDisplay({ amount, businessCurrency, className }: Props) {
  const { preferredCurrency, convert } = useCurrency();

  const businessSymbol = CURRENCY_SYMBOLS[businessCurrency];
  const primary = `${businessSymbol}${amount.toFixed(2)}`;

  const showEstimate = preferredCurrency !== businessCurrency;
  const estimated = showEstimate ? convert(amount, businessCurrency, preferredCurrency) : null;
  const estimateSymbol = CURRENCY_SYMBOLS[preferredCurrency];

  return (
    <span className={className}>
      <span className="font-bold">{primary}</span>
      {estimated !== null && (
        <span className="text-xs text-gray-400 font-normal ms-1">
          (~{estimateSymbol}{estimated.toFixed(1)})
        </span>
      )}
    </span>
  );
}
