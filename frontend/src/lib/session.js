const SESSION_KEY = 'caffe_session_id'
const CUSTOMER_NAME_KEY = 'caffe_customer_name'

export function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function getCustomerName() {
  return localStorage.getItem(CUSTOMER_NAME_KEY) || ''
}

export function setCustomerName(name) {
  localStorage.setItem(CUSTOMER_NAME_KEY, name)
}

export function clearCustomerName() {
  localStorage.removeItem(CUSTOMER_NAME_KEY)
}
