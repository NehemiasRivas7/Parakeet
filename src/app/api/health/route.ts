export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'parakeet',
    timestamp: new Date().toISOString(),
  });
}
