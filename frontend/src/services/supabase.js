const SUPABASE_URL = (
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL ||
  'https://mlifkhiluwdlutmmzrcr.supabase.co'
).replace(/\/+$/, '');

const SUPABASE_KEY = (
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_YDoHWDT1phpL9lOKtB0xGg_mb11qMBF'
);

const getHeaders = (customHeaders = {}) => ({
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  ...customHeaders,
});

class SupabaseQueryBuilder {
  constructor(table) {
    this.table = table;
    this.url = `${SUPABASE_URL}/rest/v1/${table}`;
    this.queryParams = [];
    this.method = 'GET';
    this.body = null;
    this.headers = getHeaders();
  }

  select(columns = '*') {
    this.queryParams.push(`select=${encodeURIComponent(columns)}`);
    return this;
  }

  eq(column, value) {
    this.queryParams.push(`${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}`);
    return this;
  }

  neq(column, value) {
    this.queryParams.push(`${encodeURIComponent(column)}=neq.${encodeURIComponent(value)}`);
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.queryParams.push(`order=${encodeURIComponent(column)}.${ascending ? 'asc' : 'desc'}`);
    return this;
  }

  limit(count) {
    this.queryParams.push(`limit=${parseInt(count, 10)}`);
    return this;
  }

  single() {
    this.headers['Accept'] = 'application/vnd.pgrst.object+json';
    return this;
  }

  insert(values) {
    this.method = 'POST';
    this.body = JSON.stringify(values);
    this.headers['Prefer'] = 'return=representation';
    return this;
  }

  update(values) {
    this.method = 'PATCH';
    this.body = JSON.stringify(values);
    this.headers['Prefer'] = 'return=representation';
    return this;
  }

  delete() {
    this.method = 'DELETE';
    this.headers['Prefer'] = 'return=representation';
    return this;
  }

  async execute() {
    const fullUrl = this.queryParams.length 
      ? `${this.url}?${this.queryParams.join('&')}` 
      : this.url;

    try {
      const response = await fetch(fullUrl, {
        method: this.method,
        headers: this.headers,
        body: this.body,
      });

      const contentType = response.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        return { data: null, error: data, status: response.status };
      }

      return { data, error: null, status: response.status };
    } catch (err) {
      return { data: null, error: { message: err.message }, status: 500 };
    }
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

export const supabase = {
  url: SUPABASE_URL,
  key: SUPABASE_KEY,

  from(table) {
    return new SupabaseQueryBuilder(table);
  },

  async checkConnection() {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return {
        connected: response.status < 500,
        status: response.status,
        url: SUPABASE_URL,
      };
    } catch (err) {
      return {
        connected: false,
        error: err.message,
        url: SUPABASE_URL,
      };
    }
  },
};

export default supabase;
