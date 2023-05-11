export interface FilterOption {
  label: string;
  value: string;
}

export const optionSearch = (option: FilterOption[], searchString: string) => {
  return option.filter((option) =>
    option.label.toLowerCase().includes(searchString.toLocaleLowerCase()),
  );
};
