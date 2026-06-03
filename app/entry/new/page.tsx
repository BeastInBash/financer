import { NewEntryForm, type SelectOption } from "./_components/new-entry-form";

// Static option lists for now — swap these for DB-backed accounts/categories
// once the API exists. The form's console payload already uses these IDs.
const ACCOUNTS: SelectOption[] = [
    { id: "acc_operating", name: "Operating · Bank" },
    { id: "acc_reserve", name: "Reserve · Investment" },
    { id: "acc_corporate", name: "Corporate Card · Credit" },
    { id: "acc_petty", name: "Petty Cash · Cash" },
];

const CATEGORIES: SelectOption[] = [
    { id: "cat_leases", name: "Operating Leases" },
    { id: "cat_saas", name: "SaaS & Licenses" },
    { id: "cat_payroll", name: "Payroll" },
    { id: "cat_logistics", name: "Logistics" },
    { id: "cat_utilities", name: "Utilities" },
    { id: "cat_revenue", name: "Revenue" },
];

export default function NewEntryPage() {
    return <NewEntryForm accounts={ACCOUNTS} categories={CATEGORIES} currency="USD" />;
}
