import { FC, PropsWithChildren, ReactNode } from 'react'
import { GITHUB_REPOSITORY_URL } from '../../constants/config'
import { useMediaQuery } from 'react-responsive'
import classes from './index.module.css'

interface Props {
  header?: ReactNode
}

export const LayoutBase: FC<PropsWithChildren<Props>> = ({ children, header }) => {
  const isMobile = useMediaQuery({ query: '(max-width: 1000px)' })

  return (
    <div className={classes.layout}>
      {header}
      <main className={classes.main}>{children}</main>
      {!isMobile && (
        <footer className={classes.footer}>
          <div className={classes.footerColumn}>
            <span>
              <a href={GITHUB_REPOSITORY_URL} rel="noopener noreferrer" target="_blank">
                GitHub
              </a>
            </span>
          </div>
        </footer>
      )}

      {isMobile && (
        <footer className={classes.mobileFooter}>
          <div className={classes.footerRow}>
            <span className="small">
              <a
                className={classes.mobileLink}
                href={GITHUB_REPOSITORY_URL}
                rel="noopener noreferrer"
                target="_blank"
              >
                GitHub
              </a>
            </span>
          </div>
        </footer>
      )}
    </div>
  )
}
