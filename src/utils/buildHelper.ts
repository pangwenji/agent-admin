if (import.meta.env.VITE_USER_NODE_ENV !== 'development') {
  const styles = [
    'color: #424251',
    'background: #f4f8ff',
    'font-size: 19px',
    'border: 1px solid #424251',
    'padding: 5px'
  ].join(';')
  console.log(`%c打包时间: ${__APP_INFO__.buildTime}`, styles)
}
