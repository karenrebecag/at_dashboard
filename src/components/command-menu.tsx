import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useSearch } from '@/context/search-provider'
import { navGroups } from '@/config/nav'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { ScrollArea } from './ui/scroll-area'

export function CommandMenu() {
  const navigate = useNavigate()
  const { open, setOpen } = useSearch()

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder='Type a command or search...' />
      <CommandList>
        <ScrollArea type='hover' className='h-72 pe-1'>
          <CommandEmpty>No results found.</CommandEmpty>
          {navGroups.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.url}
                  value={item.title}
                  onSelect={() => {
                    runCommand(() => navigate({ to: item.url }))
                  }}
                >
                  <div className='flex size-4 items-center justify-center'>
                    <ArrowRight className='size-2 text-muted-foreground/80' />
                  </div>
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}