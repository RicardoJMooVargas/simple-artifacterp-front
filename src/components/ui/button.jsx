export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const classes = [
    'ui-button',
    `is-${variant}`,
    `is-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <button className={classes} {...props} />
}
