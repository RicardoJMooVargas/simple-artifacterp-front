export function Card({ className = '', ...props }) {
  const classes = ['ui-card', className].filter(Boolean).join(' ')
  return <div className={classes} {...props} />
}

export function CardHeader({ className = '', ...props }) {
  const classes = ['ui-card-header', className].filter(Boolean).join(' ')
  return <div className={classes} {...props} />
}

export function CardTitle({ className = '', ...props }) {
  const classes = ['ui-card-title', className].filter(Boolean).join(' ')
  return <h2 className={classes} {...props} />
}

export function CardContent({ className = '', ...props }) {
  const classes = ['ui-card-content', className].filter(Boolean).join(' ')
  return <div className={classes} {...props} />
}
