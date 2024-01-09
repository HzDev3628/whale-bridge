'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { RefuelSchema } from '../_utils/schemas'
import { Button } from '@/components/ui/button'
import { Repeat2, ChevronDown } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { CHAINS, selectedChain } from '../_utils/chains'
import { useState } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { Slider } from '@/components/ui/slider'
import { Paper } from '../_components/paper'
import { SubmitButton } from '../_components/submit-button'
import { truncatedToaster } from '../_utils/truncatedToaster'

export default function RefuelPage() {
  const { address } = useAccount()
  const { data } = useBalance({
    address,
    onSuccess({ formatted }) {
      form.setValue('balance', Number(formatted))
    },
  })
  const balance = Number(data?.formatted)

  const [isLoading] = useState(false)

  const form = useForm<z.infer<typeof RefuelSchema>>({
    resolver: zodResolver(RefuelSchema),
    defaultValues: {
      amount: balance ? balance / 3 : 0,
      balance: balance ?? 0,
      chainFrom: 175,
      chainTo: 102,
    },
  })

  const {
    watch,
    setValue,
    formState: { isValid },
  } = form

  const fields = watch()

  function refuel({ amount, balance }: z.infer<typeof RefuelSchema>) {
    if (amount > balance)
      return truncatedToaster(
        'Insufficient balance',
        `Your balance is ${balance} ${data?.symbol}. Please enter amount less than or equal to your balance.`,
      )
    console.log(data)
  }

  return (
    <Paper title="REFUEL GAS">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(refuel)}>
          <div className="w-full flex justify-between items-center mb-5">
            <FormField
              control={form.control}
              name="chainFrom"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Transfer from</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={isLoading}
                          role="combobox"
                          variant="clean"
                          className="flex justify-between w-80 pl-3 pr-5 bg-popover"
                        >
                          {selectedChain(field.value)}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0">
                      <Command>
                        <CommandInput placeholder="Search chain..." />
                        <CommandEmpty>No chain found.</CommandEmpty>
                        <CommandGroup>
                          {CHAINS.map(({ label, value, image }) => (
                            <CommandItem
                              value={label}
                              key={value}
                              image={image}
                              disabled={fields.chainTo === value}
                              checked={value === field.value}
                              onSelect={() => {
                                form.setValue('chainFrom', value)
                              }}
                            >
                              {label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            <Repeat2
              className="stroke-foreground cursor-pointer opacity-75 hover:opacity-100 duration-300 transition-opacity relative top-3"
              onClick={() => {
                form.setValue('chainFrom', fields.chainTo)
                form.setValue('chainTo', fields.chainFrom)
              }}
            />

            <FormField
              control={form.control}
              name="chainTo"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Transfer to</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={isLoading}
                          role="combobox"
                          variant="clean"
                          className="flex justify-between w-80 pl-3 pr-5 bg-popover"
                        >
                          {selectedChain(field.value)}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0">
                      <Command>
                        <CommandInput placeholder="Search chain..." />
                        <CommandEmpty>No chain found.</CommandEmpty>
                        <CommandGroup>
                          {CHAINS.map(({ label, value, image }) => (
                            <CommandItem
                              value={label}
                              key={value}
                              image={image}
                              disabled={fields.chainFrom === value}
                              checked={value === field.value}
                              onSelect={() => {
                                form.setValue('chainTo', value)
                              }}
                            >
                              {label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-end justify-between">
                  Enter Refuel Amount
                  <button
                    type="button"
                    className="text-[10px] opacity-75 cursor-pointer text-primary duration-200 transition-opacity mr-1 hover:opacity-100 leading-[0.4]"
                    disabled={!balance}
                    onClick={() => setValue('amount', balance)}
                  >
                    MAX
                  </button>
                </FormLabel>
                <FormControl>
                  <div className="relative flex items-center">
                    <Input
                      placeholder={`0.0001 ${!balance ? 'XXX' : data?.symbol}`}
                      {...field}
                      max={balance}
                    />

                    <span className="absolute text-lg right-3 font-medium">
                      {!balance ? 'XXX' : data?.symbol}
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between w-full my-5 gap-5 text-sm font-medium max-w-xl mx-auto">
            <span className="flex items-center justify-center rounded-md py-3 max-w-20 w-full border border-primary">
              0
            </span>
            <Slider
              defaultValue={[balance / 3]}
              max={balance}
              value={[fields.amount]}
              step={0.000001}
              onValueChange={(v) => setValue('amount', v[0])}
            />
            <span className="flex items-center justify-center rounded-md py-3 w-fit min-w-20 px-2 border border-primary">
              {!balance ? '...' : balance.toFixed(5)}
            </span>
          </div>

          <article className="bg-popover rounded-md py-5 px-4 max-w-xl mx-auto mb-11">
            <h3 className="font-semibold text-lg mb-4">Transaction Summary</h3>
            <div className="flex items-center justify-between w-full font-medium text-base py-2.5 border-t border-t-primary">
              Estimated Transfer Time:
              <span className="font-semibold">~5 mins</span>
            </div>
            <div className="flex items-center justify-between w-full font-medium text-base py-2.5 border-t border-t-primary">
              Refuel cost:
              <span className="font-semibold">0.00015 ETH ($0.34)</span>
            </div>
            <div className="flex items-center justify-between w-full font-medium text-base py-2.5 border-t border-t-primary">
              Expected Output:
              <span className="font-semibold">0 MATIC ($0)</span>
            </div>
          </article>

          <SubmitButton
            disabled={!isValid || isLoading}
            chainFrom={fields.chainFrom}
          >
            Refuel
          </SubmitButton>
        </form>
      </Form>
    </Paper>
  )
}
