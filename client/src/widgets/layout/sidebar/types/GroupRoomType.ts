export type ChatItemType = {
  title: string;
  id: string;
};

export type GroupType = {
  category: string;
  items: ChatItemType[];
};
