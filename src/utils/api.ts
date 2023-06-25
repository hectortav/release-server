export type OS = "win32" | "darwin" | "linux";
export const getOs = (req: Request): OS | null => {
	const userAgent = req.headers.get("User-Agent");
	if (userAgent?.includes("win32")) {
		return "win32";
	} else if (userAgent?.includes("Mac")) {
		return "darwin";
	} else if (userAgent?.includes("Linux")) {
		return "linux";
	}
	return null;
};
