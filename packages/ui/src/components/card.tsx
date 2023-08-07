import { Amount, Type } from '@sushiswap/currency'
import * as React from 'react'
import { ReactNode } from 'react'

import { classNames, Currency, SkeletonText } from '..'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={classNames(
      'rounded-xl border border-secondary dark:border-accent bg-white dark:bg-background shadow-sm',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={classNames('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={classNames('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={classNames('text-sm text-muted-foreground', className)} {...props} />
  )
)
CardDescription.displayName = 'CardDescription'

const CardGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={classNames('flex flex-col gap-3', className)} {...props} />
  )
)
CardGroup.displayName = 'CardGroup'

const CardLabel = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={classNames('font-normal text-xs text-gray-400 dark:text-slate-600', className)}
      {...props}
    />
  )
)
CardLabel.displayName = 'CardLabel'

type CardItemProps =
  | (Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
      title: ReactNode
      subtitle?: string
      children: ReactNode
      skeleton?: never
      flex?: boolean
      className?: string
    })
  | { title?: never; subtitle?: boolean; children?: never; skeleton?: boolean; flex?: boolean; className?: string }

const CardItem = React.forwardRef<HTMLDivElement, CardItemProps>(
  ({ skeleton, flex, subtitle, title, children, className, ...props }, ref) => {
    if (skeleton) {
      return (
        <div ref={ref} className="grid grid-cols-2 gap-2" {...props}>
          <div className="flex flex-col gap-0.5">
            <SkeletonText fontSize="sm" />
            {subtitle && <SkeletonText fontSize="xs" />}
          </div>
          <div className="flex justify-end">
            <SkeletonText fontSize="sm" />
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={classNames(className, flex ? 'flex justify-between items-center' : 'grid grid-cols-2', 'gap-2')}
        {...props}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{title}</span>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        </div>
        <div className="flex justify-end">
          <span className="flex justify-end w-full text-sm font-medium text-right text-gray-900 truncate dark:text-slate-50">
            {children}
          </span>
        </div>
      </div>
    )
  }
)
CardItem.displayName = 'CardItem'

interface CardCurrencyAmountItemProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean
  amount?: Amount<Type>
  fiatValue?: string
}

const CardCurrencyAmountItem = React.forwardRef<HTMLDivElement, CardCurrencyAmountItemProps>(
  ({ isLoading, ...props }, ref) => {
    if (isLoading) {
      return <CardItem ref={ref} skeleton />
    }

    if (props.amount)
      return (
        <CardItem
          title={
            <div className="font-medium flex items-center gap-2 text-muted-foreground">
              <Currency.Icon currency={props.amount.currency} width={18} height={18} /> {props.amount.currency.symbol}
            </div>
          }
          ref={ref}
          {...props}
        >
          <span className="flex gap-1 font-semibold">
            {props.amount.toSignificant(6)}{' '}
            <span className="font-normal text-gray-400 dark:text-slate-600">{props.fiatValue}</span>
          </span>
        </CardItem>
      )

    return null
  }
)
CardCurrencyAmountItem.displayName = 'CardCurrencyAmountItem'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={classNames('p-6 pt-0 flex flex-col gap-6', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={classNames(' flex items-center p-6 pt-0', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

export {
  Card,
  CardContent,
  CardCurrencyAmountItem,
  CardDescription,
  CardFooter,
  CardGroup,
  CardHeader,
  CardItem,
  CardLabel,
  CardTitle,
}
