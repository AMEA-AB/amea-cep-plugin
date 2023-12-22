export default class BaseService {
    protected baseUrl = 'http://localhost:3001';
    
    protected fetch<T>(input: RequestInfo, init?: RequestInit, token?: string): Promise<T> {
        return fetch(input, {
            ...init,
        })
            .then((response) => {
                switch (response.status) {
                    case 400:
                    case 500:
                        response.text().then((result) => {
                            console.error(result);
                        });
                        break;
                    case 204:
                        console.log("No data was returned");
                        break;
                    default:
                        break;
                }

                // response.ok = status is in the range 200-299
                if (!response.ok || response.status === 204) {
                    return Promise.reject(response.status);
                }

                const contentType = response.headers.get("content-type");

                switch (contentType) {
                    case "application/json; charset=utf-8":
                        return response.json();
                    case "text/plain; charset=utf-8":
                        return response.text();
                    default:
                        break;
                }
            })
    }


}