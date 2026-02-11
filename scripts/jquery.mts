// Re-export jQuery to get it to work both in IDE and in browser
// The IDE reads from `@types/jquery`, and the browser reads from the jQuery CDN
import * as $ from "jquery";
export { $ };
