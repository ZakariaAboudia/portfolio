'use client'

import * as Tabs from '@radix-ui/react-tabs'

interface LocaleTabPanelProps {
  enContent: React.ReactNode
  frContent: React.ReactNode
}

export default function LocaleTabPanel({ enContent, frContent }: LocaleTabPanelProps) {
  return (
    <Tabs.Root defaultValue="en">
      <Tabs.List
        className="flex gap-0 border-b border-border-default mb-4"
        aria-label="Translation language"
      >
        <Tabs.Trigger
          value="en"
          className="px-4 py-2 text-sm font-mono text-text-secondary data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          EN
        </Tabs.Trigger>
        <Tabs.Trigger
          value="fr"
          className="px-4 py-2 text-sm font-mono text-text-secondary data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          FR (optional)
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="en">{enContent}</Tabs.Content>
      <Tabs.Content value="fr">{frContent}</Tabs.Content>
    </Tabs.Root>
  )
}
